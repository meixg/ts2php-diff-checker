import { spawn } from "child_process";
import chalk from "chalk";
import * as ts2php from 'ts2php~v0.16.1';
import * as jsDiff from "diff";
import glob from "glob";
import ProgressBar from 'progress';
import semver from 'semver';

const info = chalk.bold.green;
const error = chalk.bold.red;

export async function checkOneFile(filePath:string, oldVersion: string, newVersion: string, options?: ts2php.Ts2phpOptions) {
    const oldRes = await compileByVersion(filePath, oldVersion, options);
    const newRes = await compileByVersion(filePath, newVersion, options);

    let diff = jsDiff.structuredPatch(filePath, filePath, oldRes, newRes);
    let ret = [];

    if (diff.hunks.length === 0) {
        return '';
    }

    ret.push(`--- ${filePath}`);
    ret.push(`+++ ${filePath}`);
    for (let i = 0; i < diff.hunks.length; i++) {
        const hunk = diff.hunks[i];
        ret.push(
          '@@ -' + hunk.oldStart + ',' + hunk.oldLines
          + ' +' + hunk.newStart + ',' + hunk.newLines
          + ' @@'
        );
        ret.push.apply(ret, hunk.lines);
    }
    return ret.join('\n') + '\n';
}

export async function checkFiles(patten: string, oldVersion: string, newVersion: string, options?: ts2php.Ts2phpOptions) {
    const files = glob.sync(patten);
    let res = '';
    const total = files.length;
    let bar: ProgressBar;
    if (total > 1) {
        bar = new ProgressBar(':bar :current/:total', { total });
    }
    for(let i = 0; i < files.length; i++) {
        const file = files[i];
        const compileResult = await checkOneFile(file, oldVersion, newVersion, options);
        if (compileResult) {
            res += compileResult
        }
        bar && bar.tick();
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
    if (semver.valid(version)) {
        const moduleName = makeModuleName(version);
        try {
            require.resolve(moduleName);
        }
        catch(e) {
            console.log(info(`Install ts2php version ${version}...`));
            await run('npm', ['i', `${moduleName}@npm:ts2php@${version}`, '--registry=https://registry.npm.taobao.org'], {cwd: __dirname});
            console.log(info(`Ts2php version ${version} installed.`))
        }
    
        return require(moduleName) as typeof ts2php;
    }
    else {
        try {
            return require(version);
        }
        catch (e) {
            throw new Error(`invalid version: ${version}`);
        }
    }
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