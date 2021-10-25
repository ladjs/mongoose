const test = require('ava');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Mongoose = require('..');

// suppress logging for tests
const logger = {
  debug: () => {},
  error: () => {},
  warn: () => {}
};

test.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  t.context.uri = t.context.mongod.getUri();
});

test.after(async (t) => {
  await t.context.mongod.stop();
});

test('connects and disconnects', async (t) => {
  const mongoose = new Mongoose({
    mongo: { uri: t.context.uri },
    logger
  });
  await t.notThrowsAsync(mongoose.connect);
  await t.notThrowsAsync(mongoose.disconnect);
  t.pass();
});

test('attempts to reconnect 3 times', async (t) => {
  const mongoose = new Mongoose({
    mongo: { uri: 'some/bad/connection/string' },
    reconnectTries: 3,
    reconnectInterval: 100,
    logger
  });
  await t.throwsAsync(mongoose.connect);
  t.is(mongoose._connectionAttempts, 3);
});
