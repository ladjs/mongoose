const mongoose = require('mongoose');
const delay = require('delay');
const boolean = require('boolean');

mongoose.configure = config => {
  mongoose.config = Object.assign(
    {
      agenda: false,
      agendaCollectionName: process.env.AGENDA_COLLECTION_NAME || 'jobs',
      debug: process.env.MONGOOSE_DEBUG
        ? boolean(process.env.MONGOOSE_DEBUG)
        : false,
      logger: console,
      mongo: {},
      _connectionAttempts: 0
    },
    config
  );

  mongoose.config.mongo = Object.assign(
    {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/test',
      options: {}
    },
    mongoose.config.mongo
  );

  mongoose.config.mongo.options = Object.assign(
    {
      reconnectTries: process.env.MONGO_RECONNECT_TRIES
        ? parseInt(process.env.MONGO_RECONNECT_TRIES, 10)
        : Number.MAX_VALUE,
      reconnectInterval: process.env.MONGO_RECONNECT_INTERVAL
        ? parseInt(process.env.MONGO_RECONNECT_INTERVAL, 10)
        : 1000,
      useNewUrlParser: true
    },
    mongoose.config.mongo.options
  );

  // set debug flag
  mongoose.set('debug', mongoose.config.debug);

  // when the connection is connected
  mongoose.connection.on('connected', mongoose.connected);

  // if the connection throws an error
  mongoose.connection.on('error', mongoose.config.logger.error);

  // if agenda was defined then ensure its a valid agenda instance
  if (mongoose.config.agenda) {
    if (typeof mongoose.config.agendaCollectionName !== 'string')
      throw new Error('agenda collection name must be a String');
    mongoose.config.agenda._originalMaxConcurrency =
      mongoose.config.agenda._maxConcurrency;
  }
};

mongoose._connect = mongoose.connect;
mongoose.connect = (uri, options) => {
  uri = uri || mongoose.config.mongo.uri;
  options = options || mongoose.config.mongo.options;
  return new Promise(async (resolve, reject) => {
    try {
      await mongoose._connect(uri, options);
      // output debug info
      mongoose.config.logger.debug('mongo connected');
      resolve();
    } catch (err) {
      mongoose.config._connectionAttempts++;
      if (
        mongoose.config._connectionAttempts >=
        mongoose.config.mongo.options.reconnectTries
      )
        return reject(err);
      mongoose.config.logger.warn(
        `attempting to reconnect to mongo in ${
          mongoose.config.mongo.options.reconnectInterval
        } ms with ${mongoose.config.mongo.options.reconnectTries -
          mongoose.config._connectionAttempts} retries remaining`
      );
      await delay(mongoose.config.mongo.options.reconnectInterval);
      resolve(mongoose.connect());
    }
  });
};

if (typeof mongoose.connected !== 'function')
  mongoose.connected = () => {
    // reset the times we've tried to reconnect
    mongoose.config._connectionAttempts = 0;

    // when the connection is disconnected
    mongoose.connection.once('disconnected', mongoose.disconnected);

    mongoose.config.logger.debug(
      `mongoose connection open to ${mongoose.config.mongo.uri}`
    );

    // When the connection is connected we need to override
    // the default connection event, because agenda requires
    // us to in order to connect with the same mongoose connection
    if (!mongoose.config.agenda) return;

    // Re-use existing mongoose connection
    mongoose.config.agenda.mongo(
      // <https://github.com/rschmukler/agenda/issues/156#issuecomment-163700272>
      mongoose.connection.collection(mongoose.config.agendaCollectionName).conn
        .db,
      mongoose.config.agendaCollectionName,
      err => {
        if (err) return mongoose.config.logger.error(err);

        mongoose.config.agenda._isReady = true;

        // start accepting new jobs
        mongoose.config.agenda.maxConcurrency(
          mongoose.config.agenda._originalMaxConcurrency
        );
        mongoose.config.logger.debug(
          'agenda opened connection using existing mongoose connection'
        );
      }
    );
  };

if (typeof mongoose.disconnected !== 'function')
  mongoose.disconnected = () => {
    // stop accepting new jobs
    if (mongoose.config.agenda) mongoose.config.agenda.maxConcurrency(0);
    // output debug info
    mongoose.config.logger.error('mongoose disconnected');
    // attempt to reconnect
    mongoose
      .connect()
      .then()
      .catch(mongoose.config.logger.error);
  };

module.exports = mongoose;
