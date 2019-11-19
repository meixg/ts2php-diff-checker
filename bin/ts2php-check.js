#!/usr/bin/env node

const commander = require('commander');

// 定义当前版本
commander.version(require('../package').version);

// 定义使用方法
commander.usage('<command> <args ...> [options]');

commander
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination) => {
    console.log('clone command called');
  });

// 运行命令
commander.parse(process.argv);
