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

"use strict";

const { join, parse } = require("path");
const { CONTRACTS_OUTPUT_DIR } = require("./constant");
const { getAbi } = require("./interfaces/base");
const yargs = require("yargs");
const path = require("path");
const chalk = require("chalk");
const { FLAGS } = require("./interfaces/base");
const { readdirSync, existsSync, readFileSync } = require("fs");

const SUB_CATEGORIES = [
    "account",
    "web3j",
    "crud",
    "permission",
    "cns",
    "collaboration",
];

var INTERFACES = [];
for (let subCategory of SUB_CATEGORIES) {
    INTERFACES = INTERFACES.concat(
        require(`./interfaces/${subCategory}`).interfaces
    );
}

const COMMANDS = INTERFACES.map((value) => value.name);

function addSubCmd(subCmdInfo) {
    let command = subCmdInfo.name;
    let positionalArgs = [];
    if (subCmdInfo.args) {
        for (let i = 0; i < subCmdInfo.args.length; ++i) {
            let arg = subCmdInfo.args[i];
            if (arg.options.flag) {
                let flag = arg.options.flag;
                if (flag & FLAGS.VARIADIC) {
                    if (
                        i !== subCmdInfo.args.length - 1 ||
                        flag & FLAGS.OPTIONAL
                    ) {
                        throw new Error(
                            "Variadic parameter should be last positional parameter"
                        );
                    }
                    positionalArgs.push(i);
                    command += ` [${arg.name}..]`;
                } else if (flag & FLAGS.OPTIONAL) {
                    delete arg.options.flag;
                    yargs.option(
                        arg.name,
                        Object.assign(
                            {
                                demandOption: false,
                            },
                            arg.options
                        )
                    );
                }
            } else {
                positionalArgs.push(i);
                command += ` <${arg.name}>`;
            }
        }
    }

    yargs.command(
        command,
        chalk.cyan(subCmdInfo.describe),
        (yargs) => {
            for (let i of positionalArgs) {
                let arg = subCmdInfo.args[i];
                yargs.positional(arg.name, arg.options);
            }
            yargs.help("h").alias("h", "help");
        },
        subCmdInfo.handler
    );
}

async function completion(current, argv) {
    if (argv._.length <= 2) {
        console.error(argv._.length);
        return ["exec", "completion", "list"];
    }
    console.error("shit");

    switch (argv._[1]) {
        case "completion": {
            return [];
        }
        case "list": {
            return [];
        }
        case "exec": {
            console.log(argv);
            if (argv._.length < 3) {
                return COMMANDS;
            }

            function listContracts() {
                let files = [];
                for (let file of readdirSync(CONTRACTS_OUTPUT_DIR)) {
                    if (file.endsWith(".abi")) {
                        files.push(path.basename(file, ".abi"));
                    }
                }
                return files;
            }

            if (argv._[2] === "queryCNS") {
                if (argv._.length < 5) {
                    return listContracts();
                }
                return [];
            }

            if (argv._[2] === "deploy") {
                if (argv._.length < 4) {
                    return ["deploy", "deployByCNS"];
                }
                return [];
            }

            if (argv._[2] === "call") {
                if (argv._.length < 4) {
                    return ["call", "callByCNS"];
                }

                if (argv._.length < 5) {
                    return listContracts();
                }

                let contractName = argv._[3];
                if (argv._.length < 6) {
                    let addressPath = join(
                        CONTRACTS_OUTPUT_DIR,
                        `.${contractName}.address`
                    );

                    if (existsSync(addressPath)) {
                        try {
                            let addresses = readFileSync(
                                addressPath
                            ).toString();
                            return addresses.split("\n");
                        } catch (error) {
                            return [];
                        }
                    }
                    return [];
                }

                if (argv._.length < 7) {
                    let abi = getAbi(contractName);
                    if (abi) {
                        let functions = [];
                        for (let item of abi) {
                            if (item.type === "function") {
                                functions.push(item.value);
                            }
                        }
                        return functions;
                    }
                    return [];
                }
                return [];
            }
            return COMMANDS;
        }
    }

    return [];
}

function listCommands() {
    for (let subCategory of SUB_CATEGORIES) {
        let commands = require(`./interfaces/${subCategory}`).interfaces;
        console.log("┌────────────────┐");
        console.log(`│${subCategory.toUpperCase().padEnd(16)}│`);
        console.log("├────────────────┴" + "─".repeat(103) + "┐");
        for (let i = 0; i < commands.length; ++i) {
            let command = commands[i];
            let name = chalk.magenta(command.name.padEnd(36));
            let info = chalk.cyan(command.describe);
            console.log(`│${name}${info.padEnd(94)}`);
        }
        console.log("└─────────────────" + "─".repeat(103) + "┘");
    }
}

function main() {
    yargs
        .completion(
            "completion",
            chalk.green("Generate completion script for bash/zsh"),
            completion
        )
        .command(
            "list",
            chalk.green("List all sub-commands"),
            () => {},
            listCommands
        )
        .command(
            "exec <command> [parameters..]",
            chalk.green("Execute a specified sub-command"),
            () => {
                let index = process.argv.indexOf("exec");
                let subCmd = process.argv[index + 1];
                let subCmdInfo = INTERFACES.find(
                    (item) => item.name === subCmd
                );

                if (subCmdInfo) {
                    addSubCmd(subCmdInfo);
                } else {
                    console.error(
                        chalk.red(
                            `Sub-command \`${subCmd}\` is not supported, ` +
                                "please refer to `./cli.js list`"
                        )
                    );
                    process.exit(-1);
                }
            }
        )
        .demandCommand(
            1,
            chalk.red("You need at least one command before moving on")
        )
        .strict()
        .usage(chalk.green("Node.js CLI tool for FICSO BCOS"))
        .help("h")
        .alias("h", "help").argv;
}

main();
