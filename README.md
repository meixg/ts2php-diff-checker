# ts2php-diff-checker

Check compiled content between different ts2php versions. Make upgrade easy again!

![Language](https://img.shields.io/badge/-TypeScript-blue.svg)
[![Build Status](https://travis-ci.com/meixg/ts2php-diff-checker.svg?branch=master)](https://travis-ci.org/meixg/ts2php-diff-checker)
[![npm package](https://img.shields.io/npm/v/ts2php-diff-checker.svg)](https://www.npmjs.org/package/ts2php-diff-checker)
[![npm downloads](http://img.shields.io/npm/dm/ts2php-diff-checker.svg)](https://www.npmjs.org/package/ts2php-diff-checker)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/meixg/ts2php-diff-checker)

## install

```sh
npm i -g ts2php-diff-checker
```

## usage

Use different versions of ts2php to compile files that match pattern, and check diff between them.

Output diff results to a file if destination specified.

```sh
ts2php-check <pattern> <old-version> <new-version> [destination]
```

use `-c` to specify a compile config for ts2php:

```sh
ts2php-check ./**/index.ts 0.16.0 0.16.1 -c ./config.js
```

```javascript
// config.js
module.exports = {
    modules: {
    },
    getNamespace(file) {
        // console.log(file);
        return 'filename';
    },
    getModuleNamespace(name) {
        if (!/^\./.test(name)) {
            return '\\';
        }
        return '\\' + name + '\\';
    }
};
```

## use .js file directly

While you working on ts2php, you may want to specify a file to use.

```sh
ts2php-check 0.12.12 /path/to/ts2php/dist/index.js
```