const process = require('node:process');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const { Schema } = require('mongoose');
const delay = require('delay');
const test = require('ava');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Signale } = require('signale');

const logger = new Signale();

const Mongoose = require('..');

test.before(async (t) => {
  t.context.mongod = await MongoMemoryServer.create();
  t.context.uri = t.context.mongod.getUri();
});

test.after(async (t) => {
  await t.context.mongod.stop();
});

test('connects and disconnects', async (t) => {
  const mongoose = new Mongoose({
    logger,
    mongo: {
      uri: t.context.uri
    }
  });
  await t.notThrowsAsync(() => mongoose.connect());
  await t.notThrowsAsync(() => mongoose.disconnect());
  t.pass();
});

test('uses custom specified', async (t) => {
  const mongoose = new Mongoose({ logger });
  await t.notThrowsAsync(() => mongoose.connect('mongodb://localhost'));
  await t.notThrowsAsync(() => mongoose.disconnect());
  t.pass();
});

test('errors without uri', async (t) => {
  const mongoose = new Mongoose({ logger });
  const err = await t.throwsAsync(() => mongoose.connect());
  t.is(
    err.message,
    'The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.'
  );
});

// <https://github.com/Automattic/mongoose/issues/12961>
// eslint-disable-next-line ava/no-todo-test
test.todo('creates, stops, and retries connection with mongodb-memory-server');

// <https://github.com/Automattic/mongoose/issues/12962>
if (process.platform === 'darwin') {
  test('reconnects with mongodb', async (t) => {
    t.timeout(Number.MAX_VALUE);
    await exec('brew services start mongodb-community@4.4');
    await delay(3000);
    const mongoose = new Mongoose({
      logger,
      mongo: {
        options: { heartbeatFrequencyMS: 100, serverSelectionTimeoutMS: 1000 }
      }
    });
    await t.notThrowsAsync(() => mongoose.connect('mongodb://localhost'));
    await delay(1000);
    t.is(mongoose.connection.readyState, 1);
    const MyModel = mongoose.connection.model(
      'Test',
      new Schema({ name: String })
    );
    await exec('brew services stop mongodb-community@4.4');
    await delay(1000);
    t.is(mongoose.connection.readyState, 0);
    const err = await t.throwsAsync(() => MyModel.findOne());
    t.is(err.name, 'MongooseServerSelectionError');
    await exec('brew services start mongodb-community@4.4');
    await delay(5000);
    await t.notThrowsAsync(() => MyModel.findOne());
    t.is(mongoose.connection.readyState, 1);
  });
}

test('errors with bad connection string', async (t) => {
  const mongoose = new Mongoose({
    logger,
    mongo: {
      uri: 'some/bad/connection/string'
    }
  });
  const err = await t.throwsAsync(() => mongoose.connect());
  t.is(
    err.message,
    'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'
  );
});

test('supports writing to separate databases', async (t) => {
  const mongod1 = await MongoMemoryServer.create();
  const mongod2 = await MongoMemoryServer.create();
  const uri1 = mongod1.getUri();
  const uri2 = mongod2.getUri();
  const mongoose = new Mongoose({ logger });
  const conn1 = await mongoose.connect(uri1);
  const conn2 = await mongoose.connect(uri2);
  const schema = new Schema({ name: String });
  const Users = conn1.model('Users', schema);
  const Logs = conn2.model('Logs', schema);
  await Users.create({ name: 'foo' });
  await Logs.create({ name: 'beep' });
  const beepUser = await Users.findOne({ name: 'beep' });
  t.is(beepUser, null);
  const fooUser = await Users.findOne({ name: 'foo' });
  t.true(typeof fooUser === 'object');
  const beepLog = await Logs.findOne({ name: 'beep' });
  t.true(typeof beepLog === 'object');
});
