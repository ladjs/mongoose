# [**@ladjs/mongoose**](https://github.com/ladjs/mongoose)

[![build status](https://img.shields.io/travis/ladjs/mongoose.svg)](https://travis-ci.org/ladjs/mongoose)
[![code coverage](https://img.shields.io/codecov/c/github/ladjs/mongoose.svg)](https://codecov.io/gh/ladjs/mongoose)
[![code style](https://img.shields.io/badge/code\_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled\_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made\_with-lass-95CC28.svg)](https://github.com/lassjs/lass)
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

[yarn][]:

```sh
yarn add @ladjs/mongoose mongoose
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

| Option                       | Type    | Default          | Description                                                                                                                                                                          |
| ---------------------------- | ------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| mongo                        | Object  | {}               | mongoose connection options <br/> which are passed to mongo <br/>see [mongo options docs](https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#connection-options) |
| reconnectTries               | Number  | Number.MAX_VALUE | How many times @ladjs/mongoose will attempt to create the initial connection                                                                                                         |
| reconnectInterval            | Number  | 1000             | Time in ms between initial connection attempts                                                                                                                                       |
| debug                        | Boolean | false            | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| bufferCommands               | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| cloneSchemas                 | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| applyPluginsToDiscriminators | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| applyPluginsToChildSchemas   | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| objectIdGetter               | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| runValidators                | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| toObject                     | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| toJSON                       | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| strict                       | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| strictQuery                  | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| selectPopulatedPaths         | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| maxTimeMS                    | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| autoIndex                    | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| autoCreate                   | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |
| overwriteModels              | Boolean | undefined        | set with [mongoose.set](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)                                                                                         |


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
