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
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install @ladjs/mongoose
```

[yarn][]:

```sh
yarn add @ladjs/mongoose
```


## Usage

This package serves as a drop-in replacement for a normal Mongoose `require()` call. It carries the same exact API and returns the same Mongoose instance that it normally would (except it adds some extra glue on top).

> Basic usage:

```js
const mongoose = require('@ladjs/mongoose');
mongoose.configure();
mongoose.connect().then().catch(console.error);
```

> Advanced usage:

```js
const mongoose = require('@ladjs/mongoose');
mongoose.configure({
  // ...
});
mongoose.connect().then().catch(console.error);
```


## Contributors

| Name           | Website                   |
| -------------- | ------------------------- |
| **Nick Baugh** | <http://niftylettuce.com> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[lad]: https://lad.js.org
