const _ = require('lodash');
const delay = require('delay');
const mongoose = require('mongoose');

class Mongoose {
  constructor(config = {}) {
    this.config = _.merge(
      {
        logger: console,
        debug: false,
        mongo: {
          options: {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
            useNewUrlParser: true
          }
        },
        useCreateIndex: true
      },
      config
    );

    if (!_.isString(this.config.mongo.uri))
      throw new Error('Missing `mongo.uri` (String) connection URI');

    // store how many times we have attempted to connect/reconnect
    this._connectionAttempts = 0;

    // <https://github.com/Automattic/mongoose/issues/8144>
    // <https://github.com/Automattic/mongoose/blob/61f698c4b39d95dd09643a7efdde0a51d07a8486/lib/index.js#L141>
    this._mongoose = new mongoose.Mongoose(
      _.pick(this.config, [
        'debug',
        'bufferCommands',
        'useCreateIndex',
        'useFindAndModify',
        'useNewUrlParser',
        'cloneSchemas',
        'applyPluginsToDiscriminators',
        'applyPluginsToChildSchemas',
        'objectIdGetter',
        'runValidators',
        'toObject',
        'toJSON',
        'strict',
        'selectPopulatedPaths',
        'maxTimeMS'
      ])
    );

    //
    // connection events
    // <https://mongoosejs.com/docs/connections.html#connection-events>
    //
    this._mongoose.connection.on('connecting', () =>
      this.config.logger.debug('mongoose connection connecting')
    );
    this._mongoose.connection.on('connected', () =>
      this.config.logger.debug('mongoose connection connected')
    );
    this._mongoose.connection.on('disconnecting', () =>
      this.config.logger.debug('mongoose connection disconnecting')
    );
    this._mongoose.connection.on('disconnected', () =>
      this.config.logger.debug('mongoose connection disconnected')
    );
    this._mongoose.connection.on('close', () =>
      this.config.logger.debug('mongoose connection closed')
    );
    this._mongoose.connection.on('reconnected', () =>
      this.config.logger.debug('mongoose connection reconnected')
    );
    this._mongoose.connection.on('fullsetup', () =>
      this.config.logger.debug(
        'mongoose connection replica set connected to primary server and at least one secondary server'
      )
    );
    this._mongoose.connection.on('all', () =>
      this.config.logger.debug(
        'mongoose connection replica set connected to all servers'
      )
    );
    this._mongoose.connection.on('reconnectFailed', () =>
      this.config.logger.debug('mongoose connection reconnect failed')
    );
    this._mongoose.connection.on('reconnectTries', () =>
      this.config.logger.debug('mongoose connection reconnect tries exceeded')
    );
    this._mongoose.connection.on('error', err => this.config.logger.error(err));

    // bind this
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  async connect(
    uri = this.config.mongo.uri,
    options = this.config.mongo.options
  ) {
    //
    // NOTE: the reason why we have our own custom reconnect logic
    // is that if the initial mongoose connection attempt fails
    // then it doesn't attempt to connect again
    // (e.g. connections are only reconnected after already established)
    // and we want to continually retry even a connection from the start
    //
    try {
      await this._mongoose.connect(uri, options);
      // reset the times we've tried to reconnect
      this._connectionAttempts = 0;
    } catch (err) {
      this.config.logger.error(err);
      this._connectionAttempts++;
      if (this._connectionAttempts >= this.config.mongo.options.reconnectTries)
        throw err;
      this.config.logger.warn(
        `attempting to reconnect to mongo in ${
          this.config.mongo.options.reconnectInterval
        } ms with ${this.config.mongo.options.reconnectTries -
          this._connectionAttempts} retries remaining`
      );
      await delay(this.config.mongo.options.reconnectInterval);
      return this.connect(uri, options);
    }
  }

  async disconnect() {
    await this._mongoose.disconnect();
  }
}

module.exports = Mongoose;
