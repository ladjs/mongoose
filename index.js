const mongoose = require('mongoose');
const mergeOptions = require('merge-options');

//
// NOTE: we have to use NativeConnection instead of MongooseConnection due to doClose not being exposed
//
const Connection = require('mongoose/lib/drivers/node-mongodb-native/connection');

function log(fn, message, hideMeta) {
  if (hideMeta) fn(message, { [hideMeta]: true });
  else fn(message);
}

class Mongoose {
  constructor(config = {}) {
    this.config = mergeOptions(
      {
        logger: console,
        hideMeta: 'hide_meta',
        bindEvents: true,
        mongo: {
          options: {
            serverSelectionTimeoutMS: 9000,
            heartbeatFrequencyMS: 3000
          }
        },
        strict: true,
        strictQuery: false
      },
      config
    );

    // detect mongoose version
    this._mongooseVersion = mongoose.version;

    if (this._mongooseVersion < '6')
      throw new Error(
        'mongoose peer dependency > 6 required.\nnpm install mongoose@6'
      );

    log(
      this.config.logger.debug,
      `using mongoose v${this._mongooseVersion}`,
      this.config.hideMeta
    );

    // options from <https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set>
    const options = [
      'allowDiskUse',
      'applyPluginsToChildSchemas',
      'applyPluginsToDiscriminators',
      'autoCreate',
      'autoIndex',
      'bufferCommands',
      'bufferTimeoutMS',
      'debug',
      'id',
      'timestamps.createdAt.immutable',
      'maxTimeMS',
      'objectIdGetter',
      'overwriteModels',
      'returnOriginal',
      'runValidators',
      'sanitizeFilter',
      'selectPopulatedPaths',
      'strict',
      'strictQuery',
      'toJSON',
      'toObject'
    ];

    for (const prop of options) {
      if (typeof this.config[prop] !== 'undefined')
        mongoose.set(prop, this.config[prop]);
    }

    // bind this
    this.createConnection = this.createConnection.bind(this);
  }

  createConnection(
    uri = this.config.mongo.uri,
    options = this.config.mongo.options
  ) {
    //
    // create connection
    //

    // <https://github.com/Automattic/mongoose/issues/12970>
    const connection = new Connection(mongoose);
    connection._connectionString = uri;
    connection._connectionOptions = options;

    //
    // hacky approach so that `openUri` is not called immediately
    // <https://github.com/Automattic/mongoose/issues/12970>
    //
    connection.asPromise = function () {
      if (
        !this.$initialConnection ||
        this.readyState === mongoose.ConnectionStates.disconnected
      )
        this.$initialConnection = this.openUri(
          this._connectionString,
          this._connectionOptions
        );
      return this.$initialConnection;
    };

    mongoose.connections.push(connection);
    mongoose.events.emit('createConnection', connection);

    //
    // bind connection events
    // <https://mongoosejs.com/docs/connections.html#connection-events>
    //
    if (this.config.bindEvents) {
      connection.on('connecting', () =>
        log(
          this.config.logger.debug,
          'mongoose connection connecting',
          this.config.hideMeta
        )
      );
      connection.on('connected', () =>
        log(
          this.config.logger.debug,
          'mongoose connection connected',
          this.config.hideMeta
        )
      );
      connection.on('disconnecting', () =>
        log(
          this.config.logger.debug,
          'mongoose connection disconnecting',
          this.config.hideMeta
        )
      );
      connection.on('disconnected', () => {
        log(
          this.config.logger.debug,
          'mongoose connection disconnected',
          this.config.hideMeta
        );
      });
      connection.on('close', () =>
        log(
          this.config.logger.debug,
          'mongoose connection closed',
          this.config.hideMeta
        )
      );
      connection.on('reconnected', () =>
        log(
          this.config.logger.debug,
          'mongoose connection reconnected',
          this.config.hideMeta
        )
      );
      connection.on('fullsetup', () =>
        log(
          this.config.logger.debug,
          'mongoose connection replica set connected to primary server and at least one secondary server',
          this.config.hideMeta
        )
      );
      connection.on('all', () =>
        log(
          this.config.logger.debug,
          'mongoose connection replica set connected to all servers',
          this.config.hideMeta
        )
      );
      connection.on('reconnectFailed', () =>
        log(
          this.config.logger.error,
          'mongoose connection reconnect failed',
          this.config.hideMeta
        )
      );
      connection.on('reconnectTries', () =>
        log(
          this.config.logger.error,
          'mongoose connection reconnect tries exceeded',
          this.config.hideMeta
        )
      );
      connection.on('error', (err) => this.config.logger.error(err));
    }

    return connection;
  }
}

module.exports = Mongoose;
