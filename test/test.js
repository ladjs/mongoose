const test = require('ava');

const Mongoose = require('..');

test('connects and disconnects', async t => {
  const mongoose = new Mongoose({
    mongo: { uri: 'mongodb://localhost:27017/test' }
  });
  await t.notThrowsAsync(mongoose.connect);
  await t.notThrowsAsync(mongoose.disconnect);
  t.pass();
});

test('attempts to reconnect 3 times', async t => {
  const mongoose = new Mongoose({
    mongo: {
      uri: 'mongodb://localhost:12345/test',
      options: {
        reconnectTries: 3,
        reconnectInterval: 100
      }
    },
    cloneSchemas: true
  });
  t.is(mongoose.get('useCreateIndex'), true);
  t.is(mongoose.get('cloneSchemas'), true);
  await t.throwsAsync(mongoose.connect);
});
