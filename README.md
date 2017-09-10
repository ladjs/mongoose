# [**@ladjs/mongoose**](https://github.com/ladjs/mongoose)

[![build status](https://img.shields.io/travis/ladjs/mongoose.svg)](https://travis-ci.org/ladjs/mongoose)
[![code coverage](https://img.shields.io/codecov/c/github/ladjs/mongoose.svg)](https://codecov.io/gh/ladjs/mongoose)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://github.com/lassjs/lass)
[![license](https://img.shields.io/github/license/ladjs/mongoose.svg)](LICENSE)

> Mongoose helper for Lad


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [How it works](#how-it-works)
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

> Basic usage:

```js
const Mongoose = require('@ladjs/mongoose');
const mongoose = new Mongoose().mongoose;
```

> Advanced usage (showing default values):

```js
const Mongoose = require('@ladjs/mongoose');
const Agenda = require('agenda');

const mongoose = new Mongoose({

  // `agenda` is not set by default but is accepted
  // and by passing it here will connect agenda with
  // existing mongoose connection db instance
  agenda: new Agenda(),

  // this field is optional, and only used when `agenda`
  // option above is defined.  it is the collection name
  // used by Agenda for storing jobs, and defaults to Agenda's default
  agendaCollectionName: 'agendaJobs',

  // this field is optional but should be used if `agenda` is
  // it will basically call `agenda.every(interval, name)`
  // upon database connection (and reconnection)
  // (and of course when mongo disconnects it cancels these)
  agendaRecurringJobs: [
    // the definition below would be invoked as:
    // `agenda.every('5 minutes', 'locales')`
    [ '5 minutes', 'locales' ]
  ],

  // sets mongoose debug flag
  debug: false,

  // how often should we check to reconnect to mongo
  reconnectMs: 3000,

  // sets mongoose promise use
  Promise: global.Promise,

  // default logger, could be `new Logger()` from @ladjs/logger
  logger: console,

  // mongo connection options and database name
  // note that you should replace "test" with your own
  mongo: {
    url: 'mongodb://localhost:27017/test',
    options: {
      // opt-in to the new connection logic for mongoose v4.11+
      useMongoClient: true,
      // the maximum number of tries to reconnect
      reconnectTries: Number.MAX_VALUE
    }
  },

  // these are the default options which get inherited from stop-agenda
  // you do not have to pass these, but if you wish to customize them you can
  // <https://github.com/ladjs/stop-agenda>
  stopAgenda: {
    logger: console,
    cancelQuery: {
      repeatInterval: {
        $exists: true,
        $ne: null
      }
    },
    checkIntervalMs: 500
  }
}).mongoose;
```


## How it works

When instantiated via `new Mongoose()`, this package will do the following:

1. Create a listener for `mongoose.connection.on('connected')`
2. Create a listener for `mongoose.connection.on('error')`
3. Create a listener for `mongoose.connection.on('disconnected')`

The `mongoose` global is exposed via `.mongoose` property of the instance `new Mongoose()`.

Upon being instantiated, it will also do the following:

1. Attempt to connect to MongoDB
2. Re-use Mongoose's MongoDB connection to initialize Agenda with a collection of `config.agendaCollectionName`
3. It will call `agenda.every(interval, name)` for any jobs defined in the associative array of `config.agendaRecurringJobs`
4. Upon disconnect:

* It will gracefully use [stop-agenda][] to stop agenda and cancel recurring jobs

4. Upon reconnect

* It will re-create via `agenda.every(interval, name)` all recurring jobs defined in `config.agendaRecurringJobs`
* It will start agenda back up again with its initial max concurrency value

Finally, throughout all of the above steps in this section it will be outputting info/errors using `config.logger`.


## Contributors

| Name             | Website                   |
| ---------------- | ------------------------- |
| **Nick Baugh**   | <http://niftylettuce.com> |
| **Alexis Tyler** | <https://wvvw.me/>        |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[stop-agenda]: https://github.com/ladjs/stop-agenda
