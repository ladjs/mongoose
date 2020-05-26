# [**@ladjs/mongoose**](https://github.com/ladjs/mongoose)

[![build status](https://img.shields.io/travis/ladjs/mongoose.svg)](https://travis-ci.org/ladjs/mongoose)
[![code coverage](https://img.shields.io/codecov/c/github/ladjs/mongoose.svg)](https://codecov.io/gh/ladjs/mongoose)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://github.com/lassjs/lass)
[![license](https://img.shields.io/github/license/ladjs/mongoose.svg)](LICENSE)

> Mongoose helper for [Lad][]


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Options](#options)
  * [A note on useUnifiedTopology](#a-note-on-useunifiedtopology)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install @ladjs/mongoose mongoose
```

[yarn][]:

```sh
yarn add @ladjs/mongoose mongoose
```

Requires mongoose v5 to be a dependency in your project.


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
mongoose
  .connect()
  .then()
  .catch(console.error);
```

Now require and use the mongoose singleton in the rest of your project as you normally would.

```js
const mongoose = require('mongoose');
```


## Options

| Option                       | Type    | Default                                                                                    | Description                                                                                                                                                                |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| mongo                        | Object  | configuration object                                                                       | configuration object                                                                                                                                                       |
| mongo.options                | Object  | reconnectTries: Number.MAX_VALUE <br/> reconnectInterval: 1000 <br/> useNewUrlParser: true | any valid mongoose configuration object <br/> which is passed to mongoose.connect() <br/>see [mongoose options docs](https://mongoosejs.com/docs/connections.html#options) |
| debug                        | Boolean | false                                                                                      | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| useCreateIndex               | Boolean | true                                                                                       | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| bufferCommands               | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| useFindAndModify             | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| useNewUrlParser              | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| cloneSchemas                 | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| applyPluginsToDiscriminators | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| applyPluginsToChildSchemas   | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| objectIdGetter               | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| runValidators                | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| toObject                     | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| toJSON                       | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| strict                       | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| selectPopulatedPaths         | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| maxTimeMS                    | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |
| autoIndex                    | Boolean | undefined                                                                                  | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                               |

### A note on useUnifiedTopology

In mongoose 5.7 the mongo driver version was bumped which caused some deprecation warnings when using the option useUnifiedTopology with the options recconectTries and reconnectInterval. [**@ladjs/mongoose**](https://github.com/ladjs/mongoose) uses both of these options internally for initial connection retries if needed. However, we detect version under the hood and omit all problematic options automatically from the connection if needed. We encourage users to continue setting these options even if they are using the new unified topology.


## Contributors

| Name               | Website                   |
| ------------------ | ------------------------- |
| **Nick Baugh**     | <http://niftylettuce.com> |
| **Spencer Snyder** | <http://spencersnyder.io> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[lad]: https://lad.js.org
