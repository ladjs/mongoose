const _ = require('lodash');
const autoBind = require('auto-bind');
const boolean = require('boolean');
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
    // this._mongoose = new mongoose.Mongoose();

    // if `useCreateIndex` was set as an option then use it
    mongoose.set('useCreateIndex', boolean(this.config.useCreateIndex));

    // set debug flag
    mongoose.set('debug', boolean(this.config.debug));

    // automatically bind this on methods
    autoBind(this);

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
    mongoose.connection.on('error', err => this.config.logger.error(err));
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
      await mongoose.connect(uri, options);
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
    try {
      // attempt to disconnect
      await mongoose.disconnect();
    } catch (err) {
      this.config.logger.error(err);
    }
  }
}

module.exports = Mongoose;
