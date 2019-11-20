# ts2php-diff-checker

Check compiled content between different ts2php versions. Make upgrade easy again!

## install

```sh
npm i -g ts2php-diff-checker
```

## usage

Use different versions of ts2php to compile files that match pattern, and check diff between them. Output diff results to a file if destination specified.

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