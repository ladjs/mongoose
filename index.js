const async = require('async');
const mongoose = require('mongoose');
const delay = require('delay');

// use native promises
mongoose.Promise = global.Promise;

const stopAgenda = (agenda, config, logger, fn) => {
  // stop accepting new jobs
  agenda.maxConcurrency(0);

  async.parallel(
    // TODO: do we need to handle results arg?
    // <https://caolan.github.io/async/docs.html#reflectAll>
    async.reflectAll([
      fn => {
        // cancel recurring jobs so they get redefined on next server start
        // TODO: once PR is accepted we can take this out
        // <https://github.com/agenda/agenda/pull/501>
        if (!agenda._collection)
          return fn(new Error('collection did not exist, see agenda#501'));

        agenda.cancel(config.agendaCancelQuery, (err, numRemoved) => {
          if (err) return fn(err);
          logger.info(`cancelled ${numRemoved} jobs`);
          fn();
        });
      },
      fn => {
        // check every 500ms for jobs still running
        const jobInterval = setInterval(async () => {
          if (agenda._runningJobs.length > 0) {
            logger.info(`${agenda._runningJobs.length} jobs still running`);
          } else {
            clearInterval(jobInterval);
            // cancel recurring jobs so they get redefined on next server start
            // TODO: once PR is accepted we can take this out
            // <https://github.com/agenda/agenda/pull/501>
            if (!agenda._collection)
              return fn(new Error('collection did not exist, see agenda#501'));
            agenda.stop(fn);
          }
        }, 500);
      }
    ]),
    fn
  );
};

const reconnect = ({
  mongodb,
  mongodbOptions,
  mongooseReconnectMs,
  logger = console
}) => {
  return new Promise(async resolve => {
    try {
      await mongoose.connect(mongodb, mongodbOptions);
      resolve();
    } catch (err) {
      logger.error(err);
      logger.info(`attempting to reconnect in (${mongooseReconnectMs}) ms`);

      await delay(mongooseReconnectMs);

      resolve(reconnect());
    }
  });
};

class Mongoose {
  constructor(agenda, config = {}, logger = console) {
    // create the database connection
    mongoose.set('debug', config.mongooseDebug);

    // when the connection is connected
    mongoose.connection.on('connected', () => {
      logger.info(`mongoose connection open to ${config.mongodb}`);

      // When the connection is connected we need to override
      // the default connection event, because agenda requires
      // us to in order to connect with the same mongoose connection
      if (agenda) {
        // TODO: we need to define the recurring jobs here
        // Re-use existing mongoose connection
        agenda.mongo(
          // <https://github.com/rschmukler/agenda/issues/156#issuecomment-163700272>
          mongoose.connection.collection(config.agenda.collection).conn.db,
          config.agenda.collection,
          err => {
            if (err) {
              return logger.error(err);
            }
            // start accepting new jobs
            agenda.maxConcurrency(config.agenda.maxConcurrency);
            logger.info(
              'agenda opened connection using existing mongoose connection'
            );
          }
        );
      }
    });

    // if the connection throws an error
    mongoose.connection.on('error', logger.error);

    // when the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      logger.info('mongoose disconnected');

      // Similarly when disconnected, we need to ensure that we stop agenda
      if (agenda) {
        stopAgenda(agenda, config, logger)
          .then(() => {
            return logger.info(
              'gracefully stopped agenda due to mongoose disconnect'
            );
          })
          .catch(err => {
            return logger.error(err);
          });
      }
    });

    // connect to mongodb
    // TODO: replace with top level await?
    // TODO: async and await should not be used in a constructor
    (async () => {
      await reconnect();
    })();

    return mongoose;
  }
}

module.exports = Mongoose;
