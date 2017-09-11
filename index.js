const debug = require('debug')('@ladjs/mongoose');
const mongoose = require('mongoose');
const delay = require('delay');

class Mongoose {
  constructor(config = {}) {
    this.config = Object.assign(
      {
        agenda: false,
        agendaCollectionName: 'agendaJobs',
        agendaRecurringJobs: [],
        debug: false,
        reconnectMs: 3000,
        Promise: global.Promise,
        logger: console,
        mongo: {}
      },
      config
    );

    this.logger = this.config.logger;
    this.agenda = this.config.agenda;

    this.config.mongo = Object.assign(
      {
        url: 'mongodb://localhost:27017/test',
        options: {}
      },
      this.config.mongo
    );

    this.config.mongo.options = Object.assign(
      {
        useMongoClient: true,
        reconnectTries: Number.MAX_VALUE
      },
      this.config.mongo.options
    );

    // set debug flag
    mongoose.set('debug', this.config.debug);

    // set promise type
    mongoose.Promise = this.config.Promise;

    // when the connection is connected
    mongoose.connection.on('connected', this.connected.bind(this));

    // if the connection throws an error
    mongoose.connection.on('error', this.logger.error);

    // when the connection is disconnected
    mongoose.connection.on('disconnected', this.disconnected.bind(this));

    // if agenda was defined then ensure its a valid agenda instance
    if (this.agenda) {
      if (typeof this.config.agendaCollectionName !== 'string')
        throw new Error('agenda collection name must be a String');

      if (!Array.isArray(this.config.agendaRecurringJobs))
        throw new Error('agenda recurring jobs must be an Array');

      // if agenda was defined then store its max concurrency
      // so that upon reconnection we can reset it back to normal
      this.agendaMaxConcurrency = this.agenda._maxConcurrency;
    }

    // connect to mongodb
    this.reconnect().then();

    // expose mongoose global
    this.mongoose = mongoose;
  }

  reconnect() {
    return new Promise(async resolve => {
      try {
        await mongoose.connect(
          this.config.mongo.url,
          this.config.mongo.options
        );
        resolve();
      } catch (err) {
        this.logger.error(err);
        debug(`attempting to reconnect in (${this.config.reconnectMs}) ms`);
        await delay(this.config.reconnectMs);
        resolve(this.reconnect());
      }
    });
  }

  connected() {
    debug(`mongoose connection open to ${this.config.mongo.url}`);

    // When the connection is connected we need to override
    // the default connection event, because agenda requires
    // us to in order to connect with the same mongoose connection
    if (!this.agenda) return;

    // Re-use existing mongoose connection
    this.agenda.mongo(
      // <https://github.com/rschmukler/agenda/issues/156#issuecomment-163700272>
      mongoose.connection.collection(this.config.agendaCollectionName).conn.db,
      this.config.agendaCollectionName,
      err => {
        if (err) return this.logger.error(err);

        // we need to redefine the recurring jobs here
        // and it has to be inside `agenda.mongo` because
        // otherwise `this._collection` is not defined yet
        if (this.config.agendaRecurringJobs.length > 0) {
          this.config.agendaRecurringJobs.forEach(def => {
            if (!Array.isArray(def))
              throw new Error('recurring job definition was not an array');
            if (typeof def[0] !== 'string')
              throw new Error(
                'recurring job definition interval must be a String'
              );
            if (typeof def[1] !== 'string')
              throw new Error('recurring job definition name must be a String');
            debug(`scheduling every ${def[0]} the job named ${def[1]}`);
            this.agenda.every.apply(this.agenda, def);
          });
        }

        // start accepting new jobs
        this.agenda.maxConcurrency(this.agendaMaxConcurrency);
        debug('agenda opened connection using existing mongoose connection');
      }
    );
  }

  disconnected() {
    debug('mongoose disconnected');
  }
}

module.exports = Mongoose;
