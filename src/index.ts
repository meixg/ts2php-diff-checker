import { spawn } from "child_process";
import chalk from "chalk";
import * as ts2php from 'ts2php~v0.16.1';
import gitDiff from "git-diff";
import glob from "glob";
import ProgressBar from 'progress';

const info = chalk.bold.green;
const error = chalk.bold.red;

export async function checkOneFile(filePath:string, oldVersion: string, newVersion: string, options?: ts2php.Ts2phpOptions) {
    const oldRes = await compileByVersion(filePath, oldVersion, options);
    const newRes = await compileByVersion(filePath, newVersion, options);

    const diff = gitDiff(oldRes, newRes);
    return diff;
}

export async function checkFiles(patten: string, oldVersion: string, newVersion: string, options?: ts2php.Ts2phpOptions) {
    const files = glob.sync(patten);
    let res = '';
    const total = files.length;
    const bar = new ProgressBar(':bar :current/:total', { total });
    for(let i = 0; i < files.length; i++) {
        const file = files[i];
        const compileResult = await checkOneFile(file, oldVersion, newVersion, options);
        if (compileResult) {
            res += `diff ${file}\n`;
            res += compileResult
        }
        bar.tick();
    };
    return res;
}

async function compileByVersion(filePath: string, version: string, options?: ts2php.Ts2phpOptions) {
    const ts2php = await getTs2phpByVersion(version);
    const result = ts2php.compile(filePath, options);

    if (result.errors.length !== 0) {
        console.log(error(`File: ${filePath} compile error: ${result.errors.map(item => item.msg).join('; ')}`));
    }
    return result.phpCode;
}

async function getTs2phpByVersion(version: string) {
    const moduleName = makeModuleName(version);
    try {
        require.resolve(moduleName);
    }
    catch(e) {
        console.log(info(`Install ts2php version ${version}...`));
        await run('npm', ['i', `${moduleName}@npm:ts2php@${version}`, '--no-save'], {cwd: __dirname});
        console.log(info(`Ts2php version ${version} installed.`))
    }

    return require(moduleName) as typeof ts2php;
}

function makeModuleName(version: string) {
    return `ts2php~v${version}`;
}

function run(command, args, options?) {
    return new Promise((resolve, reject) => {
        const ls = spawn(command, args, options);
        // ls.stderr.pipe(process.stderr);
        // ls.stdout.pipe(process.stdout);
        ls.on('close', (code) => {
            if (code === 0) {
                return resolve();
            }
            reject();
        });
    });
}