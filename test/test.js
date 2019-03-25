const test = require('ava');

const mongoose = require('..');

test('connects', async t => {
  mongoose.configure();
  await mongoose.connect();
  t.pass();
});
