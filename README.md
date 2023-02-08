# [**@ladjs/mongoose**](https://github.com/ladjs/mongoose)

[![build status](https://github.com/ladjs/mongoose/actions/workflows/ci.yml/badge.svg)](https://github.com/ladjs/mongoose/actions/workflows/ci.yml)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://github.com/lassjs/lass)
[![license](https://img.shields.io/github/license/ladjs/mongoose.svg)](LICENSE)

> Mongoose helper for [Lad][], which is used as an alternative to the default `mongoose.connect()` for multiple connection management.  See the [Forward Email][forward-email] codebase for further insight into setup.


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Options](#options)
* [Contributors](#contributors)
* [License](#license)


## Install

> **Requires mongoose v6+ to be a dependency in your project.**

[npm][]:

```sh
npm install @ladjs/mongoose mongoose
```


## Usage

```js
const Mongoose = require('@ladjs/mongoose');
const { Schema } = require('mongoose');

(async () => {
  const m = new Mongoose({
    mongo: {
      options: { heartbeatFrequencyMS: 100, serverSelectionTimeoutMS: 1000 }
    }
  });

  const conn1 = await m.createConnection('mongodb://server-one.example.com/database-name').asPromise();
  const conn2 = await m.createConnection('mongodb://server-two.example.com/database-name').asPromise();

  const UserSchema = new Schema({ name: String });
  const LogSchema = new Schema({ name: String });

  const Users = conn1.model('Users', UserSchema);
  const Logs = conn2.model('Logs', LogSchema);

  // write to the server-one.example.com database
  await Users.create({ name: 'test' });

  // write to the server-two.example.com database
  await Logs.create({ name: 'test' });
})();
```

Note that instances of this class `Mongoose` only have the method `createConnection`.  It is not 1:1 with `mongoose` normal singleton.

You should use [@ladjs/graceful][lad-graceful] to manage process SIGHUP and graceful exits.


## Options

| Option                           | Type                      | Default                                                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `logger`                         | Object                    | `console`                                                                       | Custom logger function, see [cabin][] or [axe][] as a default if desired.                                                                                                                                                                                                                                                                                                                                    |
| `mongo`                          | Object                    | ---                                                                             | See below `uri` and `options` properties.                                                                                                                                                                                                                                                                                                                                                                    |
| `mongo.uri`                      | String                    | undefined                                                                       | mongo connection URI <br/> which is passed as the first argument to `mongoose.createConnection` <br/>see [mongo options docs](https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#connection-options)                                                                                                                                                                                     |
| `mongo.options`                  | Object                    | undefined                                                                       | mongo connection options <br/> which is passed as the second argument to `mongoose.createConnection` <br/>see [mongo options docs](https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#connection-options)                                                                                                                                                                                |
| `bindEvents`                     | Boolean                   | `true`                                                                          | Whether or not to bind default events to the Mongoose connection using provided `logger`.                                                                                                                                                                                                                                                                                                                    |
| `hideMeta`                       | String or `false` Boolean | `"hide_meta"`                                                                   | Appends a `true` boolean property to a property with this value in logs, e.g. `console.log('mongoose disconnected', { hide_meta: true });` which is useful for preventing metadata object from being invoked as the second argument (this is meant for usage with [Cabin][] and [Axe][] and made for [Forward Email][forward-email]). If you pass a `false` value then this property will not get populated. |
| ---                              | ---                       | ---                                                                             | ---                                                                                                                                                                                                                                                                                                                                                                                                          |
| `allowDiskUse`                   | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `applyPluginsToChildSchemas`     | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `applyPluginsToDiscriminators`   | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `autoCreate`                     | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `autoIndex`                      | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `bufferCommands`                 | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `bufferTimeoutMS`                | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `debug`                          | Boolean                   | If `process.env.MONGOOSE_DEBUG` is truthy, then it is `true`, otherwise `false` | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `id`                             | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `timestamps.createdAt.immutable` | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `maxTimeMS`                      | Number                    | `10000`                                                                         | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `objectIdGetter`                 | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `overwriteModels`                | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `returnOriginal`                 | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `runValidators`                  | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `sanitizeFilter`                 | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `selectPopulatedPaths`           | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `strict`                         | Boolean                   | `true`                                                                          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `strictQuery`                    | Boolean                   | `true`                                                                          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `toJSON`                         | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `toObject`                       | Boolean                   | undefined                                                                       | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |


## Contributors

| Name               | Website                   |
| ------------------ | ------------------------- |
| **Nick Baugh**     | <http://niftylettuce.com> |
| **Spencer Snyder** | <http://spencersnyder.io> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


##

[npm]: https://www.npmjs.com/

[lad]: https://lad.js.org

[mongoose.set]: https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set

[cabin]: https://github.com/cabinjs/cabin

[axe]: https://github.com/cabinjs/axe

[forward-email]: https://github.com/forwardemail/forwardemail.net

[lad-graceful]: https://github.com/ladjs/graceful
