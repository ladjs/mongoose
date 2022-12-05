# [**@ladjs/mongoose**](https://github.com/ladjs/mongoose)

[![build status](https://github.com/ladjs/mongoose/actions/workflows/ci.yml/badge.svg)](https://github.com/ladjs/mongoose/actions/workflows/ci.yml)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://github.com/lassjs/lass)
[![license](https://img.shields.io/github/license/ladjs/mongoose.svg)](LICENSE)

> Mongoose helper for [Lad][]


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Options](#options)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install @ladjs/mongoose mongoose
```

Requires mongoose v6 to be a dependency in your project.


## Usage

This package is a mongoose connection helper that sets up some sensible default connection options for mongoose and event dubugging helpers.

The default options are outlined below.

This package also provides reconnection logic on the initial connection. This is especcially convenient as this is not baked into mongo or mongoose natively. Mongoose will, however, take over reconnection in the event there is a disconnect event.

> Usage:

```js
const Mongoose = require('@ladjs/mongoose');
const mongoose = new Mongoose({
  // ...
});

(async () => {
  await mongoose.connect();
})();
```

Now require and use the mongoose singleton in the rest of your project as you normally would.

```js
const mongoose = require('mongoose');
```


## Options

| Option                           | Type                      | Default            | Description                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mongo`                          | Object                    | {}                 | mongoose connection options <br/> which are passed to mongo <br/>see [mongo options docs](https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#connection-options)                                                                                                                                                                                                                         |
| `reconnectTries`                 | Number                    | `Number.MAX_VALUE` | How many times @ladjs/mongoose will attempt to create the initial connection                                                                                                                                                                                                                                                                                                                                 |
| `reconnectInterval`              | Number                    | `1000`             | Time in ms between initial connection attempts                                                                                                                                                                                                                                                                                                                                                               |
| `hideMeta`                       | String or `false` Boolean | `"hide_meta"`      | Appends a `true` boolean property to a property with this value in logs, e.g. `console.log('mongoose disconnected', { hide_meta: true });` which is useful for preventing metadata object from being invoked as the second argument (this is meant for usage with [Cabin][] and [Axe][] and made for [Forward Email][forward-email]). If you pass a `false` value then this property will not get populated. |
| ---                              | ---                       | ---                | ---                                                                                                                                                                                                                                                                                                                                                                                                          |
| `applyPluginsToChildSchemas`     | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `applyPluginsToDiscriminators`   | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `autoCreate`                     | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `autoIndex`                      | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `debug`                          | `false`                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `returnOriginal`                 | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `bufferCommands`                 | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `cloneSchemas`                   | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `timestamps.createdAt.immutable` | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `maxTimeMS`                      | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `objectIdGetter`                 | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `overwriteModels`                | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `returnOriginal`                 | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `runValidators`                  | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `sanitizeFilter`                 | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `selectPopulatedPaths`           | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `strict`                         | `true`                    | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `strictQuery`                    | `false`                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `toJSON`                         | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |
| `toObject`                       | Boolean                   | undefined          | set with [mongoose.set][mongoose.set]                                                                                                                                                                                                                                                                                                                                                                        |


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
