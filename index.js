const delay = require('delay');
const mongoose = require('mongoose');
const mergeOptions = require('merge-options');

class Mongoose {
  constructor(config = {}) {
    this.config = mergeOptions(
      {
        logger: console,
        debug: false,
        mongo: {},
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        hideMeta: 'hide_meta',
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

    this.config.logger.debug(`using mongoose v${this._mongooseVersion}`);

    // store how many times we have attempted to connect/reconnect
    this._connectionAttempts = 0;

    // options from <https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set>
    const options = [
      'applyPluginsToChildSchemas',
      'applyPluginsToDiscriminators',
      'autoCreate',
      'autoIndex',
      'debug',
      'returnOriginal',
      'bufferCommands',
      'cloneSchemas',
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

    for (const prop in options) {
      if (typeof this.config[prop] !== 'undefined')
        mongoose.set(prop, this.config[prop]);
    }

    //
    // connection events
    // <https://mongoosejs.com/docs/connections.html#connection-events>
    //
    mongoose.connection.on('connecting', () =>
      this.config.logger.debug('mongoose connection connecting')
    );
    mongoose.connection.on('connected', () =>
      this.config.logger.debug('mongoose connection connected')
    );
    mongoose.connection.on('disconnecting', () =>
      this.config.logger.debug('mongoose connection disconnecting')
    );
    mongoose.connection.on('disconnected', () =>
      this.config.logger.debug('mongoose connection disconnected')
    );
    mongoose.connection.on('close', () =>
      this.config.logger.debug('mongoose connection closed')
    );
    mongoose.connection.on('reconnected', () =>
      this.config.logger.debug('mongoose connection reconnected')
    );
    mongoose.connection.on('fullsetup', () =>
      this.config.logger.debug(
        'mongoose connection replica set connected to primary server and at least one secondary server'
      )
    );
    mongoose.connection.on('all', () =>
      this.config.logger.debug(
        'mongoose connection replica set connected to all servers'
      )
    );
    mongoose.connection.on('reconnectFailed', () =>
      this.config.logger.debug('mongoose connection reconnect failed')
    );
    mongoose.connection.on('reconnectTries', () =>
      this.config.logger.debug('mongoose connection reconnect tries exceeded')
    );
    mongoose.connection.on('error', (err) => this.config.logger.error(err));

    // bind this
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.get = mongoose.get;
    this.set = mongoose.set;
  }

  async connect(uri = this.config.mongo.uri, options = this.config.mongo) {
    //
    // NOTE: the reason why we have our own custom reconnect logic
    // is that if the initial mongoose connection attempt fails
    // then it doesn't attempt to connect again
    // (e.g. connections are only reconnected after already established)
    // and we want to continually retry even a connection from the start.
    try {
      if (typeof uri !== 'string')
        throw new Error(
          'Missing uri: pass a valid connection URI string as a parameter to `connect` or set the `mongo.uri` key in the mongoose constructor.'
        );

      delete options.uri;

      await mongoose.connect(uri, options);
      // reset the times we've tried to reconnect
      this._connectionAttempts = 0;
    } catch (err) {
      this.config.logger.error(err);
      this._connectionAttempts++;
      if (this._connectionAttempts >= this.config.reconnectTries) throw err;
      this.config.logger.warn(
        `attempting to reconnect to mongo in ${
          this.config.reconnectInterval
        } ms with ${
          this.config.reconnectTries - this._connectionAttempts
        } retries remaining`
      );
      await delay(this.config.reconnectInterval);
      return this.connect(uri, options);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
  }
}

module.exports = Mongoose;
