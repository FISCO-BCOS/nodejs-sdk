#!/usr/bin/env node

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const chalk = require('chalk');

let cwd = process.cwd();
let dirname = __dirname;
if (cwd !== dirname) {
    console.error(chalk.red('[ERROR]:cli.js must be run in \`nodejs-sdk/packages/cli/\` directory'));
    process.exit(-1);
}

const FLAGS = require('./interfaces/base').FLAGS;
const yargs = require('yargs/yargs');
const fs = require('fs');
const path = require('path');
const { ContractsDir, ContractsOutputDir } = require('./constant');

const getAbi = require('./interfaces/general').getAbi;

let interfaces = require('./interfaces/general').interfaces;
interfaces = interfaces.concat(require('./interfaces/crud').interfaces);
let commands = interfaces.map(value => value.name);

function parseSub(subCommandInfo, argv) {
    let command = argv.command;
    argv.arguments.splice(0, 0, command);

    if (subCommandInfo.args) {
        for (let arg of subCommandInfo.args) {
            if (arg.options.flag) {
                if(arg.options.flag === FLAGS.VARIADIC)
                {
                    command += ` [${arg.name}...]`;
                } else if (arg.options.flag === FLAGS.OPTIONAL) {
                    command += ` [${arg.name}]`;
                }

                delete arg.options.flag;
            } else {
                command += ` <${arg.name}>`;
            }
        }
    }

    let needHelp = argv.arguments.indexOf('?') >= 0;
    if (needHelp) {
        argv.arguments = [argv.arguments[0]];
        if (subCommandInfo.args) {
            argv.arguments = argv.arguments.concat(Array(subCommandInfo.args.length).fill('?'));
        }
    }

    let parser = yargs(argv.arguments)
        .command(command, chalk.cyan(subCommandInfo.describe), yargs => {
            if (subCommandInfo.args) {
                for (let arg of subCommandInfo.args) {
                    yargs.positional(arg.name, arg.options);
                }
            }
            return yargs;
        }, needHelp ? undefined : subCommandInfo.handler);

    if (needHelp) {
        parser.showHelp();
    } else {
        parser.parse(argv.arguments);
    }
}

function completion() {
    let commandList = commands;
    let userDefList = ['completion', 'list'];

    return function (current, argv) {
        let wordList = commandList.concat(userDefList);

        if (argv._.length < 2) {
            return wordList;
        }

        if (argv._[1] === 'completion' || argv._[1] === 'list') {
            return [];
        }

        function listContracts() {
            let files = fs.readdirSync(ContractsDir)
                .filter(file => file.endsWith('.sol'))
                .map(file => path.parse(file).name);
            return files;
        }

        if (argv._[1] === 'deploy') {
            if (argv._.length < 4) {
                return listContracts();
            } else {
                return [];
            }
        }

        if (argv._[1] === 'call') {
            if (argv._.length < 4) {
                return listContracts();
            } else if (argv._.length < 5) {
                let contractName = path.basename(argv._[2], '.sol');
                let addressPath = path.join(ContractsOutputDir, `.${contractName}.address`);
                if (fs.existsSync(addressPath)) {
                    try {
                        let addresses = fs.readFileSync(addressPath).toString();
                        return addresses.split('\n');
                    } catch (error) {
                        return [];
                    }
                } else {
                    return [];
                }
            } else if (argv._.length < 6) {
                let abi = getAbi(argv._[2]);
                if (abi) {
                    let functions = abi.filter(value => value.type === 'function').map(value => value.name);
                    return functions;
                } else {
                    return [];
                }
            } else {
                return [];
            }
        }

        if (argv._.length >= 3) {
            return [];
        }

        return wordList;
    };
}

function list() {
    for (let command of interfaces) {
        let name = chalk.magenta(command.name.padEnd(50));
        let info = chalk.cyan(command.describe);

        console.log(`${name}${info}`);
    }
}

function main() {
    let parser = yargs()
        .completion('completion', chalk.green('generate completion script'), completion())
        .command('$0 list', chalk.green('list all commands'))
        .command('$0 <command> [arguments...]', chalk.green('run a specified command'), yargs => {
            yargs.positional('command', {
                describe: chalk.green('the command to run'),
                type: 'string',
                choices: commands.concat(['completion', 'list'])
            });
        })
        .usage(chalk.bold.green('Node.js CLI tool for FICSO BCOS 2.0'))
        .help('h')
        .alias('h', 'help');

    let argv = parser.parse(process.argv.splice(2));

    switch (argv.command) {
        case 'completion':
            parser.showCompletionScript();
            break;
        case 'list':
            list();
            break;
        default:
            let command = argv.command;
            let subCommandInfo = interfaces.find(value => value.name == command);
            if (subCommandInfo) {
                parseSub(subCommandInfo, argv);
            } else {
                parser.showHelp();
            }
    }
}

main();
