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
const isJSON = require('is-json');
const fs = require('fs');
const path = require('path');
const ContractsOutputDir = require('../constant').ContractsOutputDir;

module.exports.produceSubCommandInfo = function (subCommand, handler) {
    let subCommandInfo = {
        name: subCommand.name,
        describe: subCommand.describe,
        handler: (argv) => {
            try {
                let ret = handler(argv);
                if (ret) {
                    if (ret instanceof Promise) {
                        ret.then(result => {
                            if (result instanceof Object) {
                                if (isJSON(result, true)) {
                                    result = JSON.stringify(result);
                                }
                            }
                            console.log(result);
                        }).catch(reason => {
                            process.exitCode = -1;

                            if (reason instanceof Error) {
                                console.error(chalk.red(reason.stack));
                            } else {
                                if (reason instanceof Object) {
                                    if (isJSON(reason, true)) {
                                        reason = JSON.stringify(reason);
                                    }
                                }
                                console.error(chalk.red(reason));
                            }
                        });
                    }
                    else {
                        console.log(ret);
                    }
                }
            } catch (error) {
                process.exitCode = -1;
                console.error(chalk.red(error.stack));
            }
        }
    };

    if (subCommand.args) {
        subCommand.args.forEach((value, index) => {
            value.options.describe = chalk.green(value.options.describe);
            if (value.options.flags) {
                if (index !== (subCommand.args.length - 1)) {
                    console.error(chalk.red(`[ERROR]:register \`${subCommand.name}\` sub-command failed, ` +
                        `variadic/optional parameter \`${value.name}\` must be at last position!`));
                    process.exit(-1);
                }
            }
        });
        subCommandInfo.args = subCommand.args;
    }

    return subCommandInfo;
};

module.exports.FLAGS = {
    OPTIONAL: 0x1,
    VARIADIC: 0x2
};

module.exports.getAbi = function (contractName) {
    if (contractName.endsWith('.sol')) {
        contractName = path.basename(contractName, '.sol');
    }

    let outputDir = ContractsOutputDir;
    let abiPath = path.join(outputDir, `${contractName}.abi`);

    if (!fs.existsSync(abiPath)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(abiPath));
};
