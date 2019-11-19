#!/usr/bin/env node

const {checkFiles} = require('../dist/index');
const chalk = require('chalk');

const oldVersion = process.argv[2];
const newVersion = process.argv[3];

const error = chalk.bold.red;
const info = chalk.bold.green;
const highlight = chalk.bold.yellow;

if (!oldVersion || !newVersion) {
    console.log(error('Must specify old version and new version!'));
}

console.log(info('checking old version:'), highlight(oldVersion), info('between new version:'), highlight(newVersion), info('...'));

// console.log(process.cwd());
(async () => {
    const res = await checkFiles('./**/dataModifier.ts', oldVersion, newVersion, {
        modules: {
            '@baidu/vui-utils': {
                namespace: '\\',
                required: true
            },
            'ts2php/types/php': {
                required: true
            }
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
    });

    console.log(res);
})();