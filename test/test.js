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

test('connects', async (t) => {
  const m = new Mongoose({
    logger,
    mongo: {
      uri: t.context.uri
    }
  });
  await t.notThrowsAsync(() => m.createConnection().asPromise());
  t.pass();
});

test('uses custom specified', async (t) => {
  const m = new Mongoose({ logger });
  await t.notThrowsAsync(() =>
    m.createConnection('mongodb://localhost').asPromise()
  );
  t.pass();
});

test('errors without uri', async (t) => {
  const m = new Mongoose({ logger });
  const err = await t.throws(() => m.createConnection());
  t.is(
    err.message,
    'The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.'
  );
});

// <https://github.com/Automattic/mongoose/issues/12961>
test('creates, stops, and retries connection with mongodb-memory-server', async (t) => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const m = new Mongoose({
    logger,
    mongo: {
      options: { heartbeatFrequencyMS: 100, serverSelectionTimeoutMS: 1000 }
    }
  });
  t.is(mongod.state, 'running');
  const conn = m.createConnection(uri);
  await t.notThrowsAsync(() => conn.asPromise());
  await delay(500);
  t.is(conn.readyState, 1);
  await mongod.stop({ doCleanup: false });
  t.is(mongod.state, 'stopped');
  await delay(500);
  t.is(conn.readyState, 0);
  await mongod.start(true);
  t.is(mongod.state, 'running');
  await delay(500);
  t.is(conn.readyState, 1);
});

// <https://github.com/Automattic/mongoose/issues/12962>
if (process.platform === 'darwin') {
  test('reconnects with mongodb', async (t) => {
    t.timeout(Number.MAX_VALUE);
    await exec('brew services start mongodb-community@4.4');
    await delay(3000);
    const m = new Mongoose({
      logger,
      mongo: {
        options: { heartbeatFrequencyMS: 100, serverSelectionTimeoutMS: 1000 }
      }
    });
    const conn = m.createConnection('mongodb://localhost');
    await t.notThrowsAsync(() => conn.asPromise());
    await delay(1000);
    t.is(conn.readyState, 1);
    const MyModel = conn.model('Test', new Schema({ name: String }));
    await exec('brew services stop mongodb-community@4.4');
    await delay(1000);
    t.is(conn.readyState, 0);
    const err = await t.throwsAsync(() => MyModel.findOne());
    t.is(err.name, 'MongooseServerSelectionError');
    await exec('brew services start mongodb-community@4.4');
    await delay(5000);
    await t.notThrowsAsync(() => MyModel.findOne());
    t.is(conn.readyState, 1);
  });
}

test('errors with bad connection string', async (t) => {
  const m = new Mongoose({
    logger,
    mongo: {
      uri: 'some/bad/connection/string'
    }
  });
  const err = await t.throwsAsync(() => m.createConnection().asPromise());
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
  const m = new Mongoose({ logger });
  const conn1 = await m.createConnection(uri1).asPromise();
  const conn2 = await m.createConnection(uri2).asPromise();
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
