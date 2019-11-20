#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const {checkFiles} = require('../dist/index');
const path = require('path');


const write = {
    error: chalk.bold.red,
    info: chalk.bold.green,
    highlight: chalk.bold.yellow,
    normal: chalk.white
}


// 定义当前版本
program.version(require('../package').version);

// 定义使用方法
program.usage('<command> <args ...> [options]');

program
    .command('aladdin <old-version> <new-version> [destination]')
    .description('Use preset config')
    .option('-p, --pattern <pattern>', 'specify a different pattern', './**/dataModifier.ts')
    .action(async (oldVersion, newVersion, destination, args) => {
        await check(oldVersion, newVersion, args.pattern, {
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
                return 'filename';
            },
            getModuleNamespace(name) {
                if (!/^\./.test(name)) {
                    return '\\';
                }
                return '\\' + name + '\\';
            }
        }, destination);
    });

program
    .command('check <pattern> <old-version> <new-version> [destination]')
    .description('Use different versions of ts2php to compile files that match pattern, and check diff between them. Output diff results to a file if destination specified.')
    .option('-c, --config <config path>', 'ts2php config file to use while compile, must be a js file with module.exports = {// config}')
    .action(async (pattern, oldVersion, newVersion, destination, args) => {
        let options = {
            getNamespace(file) {
                return 'filename';
            },
            getModuleNamespace(name) {
                if (!/^\./.test(name)) {
                    return '\\';
                }
                return '\\' + name + '\\';
            }
        };
        if (args.config) {
            try {
                options = Object.assign({}, options, require(path.resolve(process.cwd(), args.config)));
            }
            catch(e) {}
        }
        await check(oldVersion, newVersion, pattern, options, destination);
    });

// 运行命令
program.parse(process.argv);

async function check(oldVersion, newVersion, pattern, options, destination) {
    console.log(
        write.normal('Checking old version:'),
        write.highlight(oldVersion),
        write.normal('between new version:'),
        write.highlight(newVersion),
        write.normal('...')
    );

    const res = await checkFiles(pattern, oldVersion, newVersion, options);

    if (!res) {
        console.log(write.info('All the results are same!'));
        return;
    }

    if (destination) {
        console.log(write.info(`Writing diff results in ${destination}...`));
        fs.writeFileSync(destination, res, {encoding: 'utf8'});
    }
    else {
        console.log(res);
    }

    console.log(write.info('done'));
}


const commands = ['aladdin', 'check'];
if (commands.indexOf(process.argv[2]) === -1) {
    console.log(write.error('Invalid command! Use -h to see help.'));
}

