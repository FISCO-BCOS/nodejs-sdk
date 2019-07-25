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

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const assert = require('assert');
const events = require('events');
const abi = require('ethjs-abi');

/**
 * Read config file.
 * The config file is a JSON-fomatted file, it should contain following top-level fields:
 *  - `account`: string, user's account
 *  - `privateKey`: string, user's private key
 *  - `nodes`: [Object], each object in nodes list should contain following fields:
 *    - `ip`: IP address of the node
 *    - `port`: Channel port of the node
 *  - `authentication`: Object, should contain following fields:
 *    - `key`: path of private key file
 *    - `cert`: path of certificate file
 *    - `ca`: path of CA root certificate file
 *  - `groupID`: interger, which group you want to connect
 *  - `timeout`: the max waiting time before a node returns a transaction receipt back
 */
module.exports.readConfig = function ($config) {
    if (typeof $config === 'string') {
        let configFileDir = path.dirname($config);
        let config = JSON.parse(fs.readFileSync($config));

        // Amend relative path
        for (let key in config.authentication) {
            let keyPath = config.authentication[key];
            if (!path.isAbsolute(keyPath)) {
                config.authentication[key] = path.join(configFileDir, config.authentication[key])
            }
        }
        return config;
    } else {
        return $config;
    }
};

/**
 * Select a node from node list randomly
 * @param {Array} nodes Node list
 * @return {Object} Node
 */
module.exports.selectNode = function (nodes) {
    return nodes[Math.floor(Math.random() * nodes.length)];
};

class CompileError extends Error {
    constructor(message) {
        super(message);
        this.name = "CompileError";
    }
}

function compileWithSolcJS(contractPath, outputDir) {
    let contractName = path.basename(contractPath, '.sol');

    let contractContent = fs.readFileSync(contractPath).toString();
    let verReg = /pragma\s+solidity\s+\^(.*)\s*;/;
    let ver = verReg.exec(contractContent)[1] || null;

    let readCallback = (importContractName) => {
        let importContractPath = path.join(path.dirname(contractPath), importContractName);
        return { contents: fs.readFileSync(importContractPath).toString() };
    };
    let writeToFile = (abi, bin) => {
        if(typeof abi !== 'string') {
            abi = JSON.stringify(abi);
        }

        if(typeof bin !== 'string') {
            bin = JSON.stringify(bin);
        }

        let abiFileName = contractName + '.abi';
        let binFileName = contractName + '.bin';

        fs.writeFileSync(path.join(outputDir, abiFileName), abi);
        fs.writeFileSync(path.join(outputDir, binFileName), bin);
    };

    let solc = null;
    let output = null;
    if (ver && ver.startsWith('0.5')) {
        solc = require('./solc-0.5');
        let input = {
            language: "Solidity",
            sources: {
                [contractName]: {
                    content: contractContent
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        };
        output = JSON.parse(solc.compile(JSON.stringify(input), readCallback));
        if (output.errors) {
            throw new CompileError(JSON.stringify(output.errors));
        }

        let abi = output.contracts[contractName][contractName].abi;
        let bin = output.contracts[contractName][contractName].evm.bytecode.object;
        writeToFile(abi, bin);
    } else {
        solc = require('./solc-0.4');
        let input = {
            sources: {
                [contractName]: contractContent
            }
        };

        output = solc.compile(input, 1, readCallback);
        if (output.errors) {
            throw new CompileError(JSON.stringify(output.errors));
        }

        let abi = output.contracts[`${contractName}:${contractName}`].interface;
        let bin = output.contracts[`${contractName}:${contractName}`].bytecode;
        writeToFile(abi, bin);
    }

    return Promise.resolve();
}

function compileWithBin(outputDir, contractPath, solc) {
    let execEmitter = new events.EventEmitter();
    let execPromise = new Promise((resolve, reject) => {
        execEmitter.on('done', () => {
            resolve();
        });
        execEmitter.on('error', (stdout, stderr) => {
            console.error(chalk.red(`Compiling error: ${stdout}\n${stderr}`));
            reject();
        });
    });

    let cmd = `${solc} --overwrite --abi --bin -o ${outputDir} ${contractPath}`;
    childProcess.exec(
        cmd,
        (error, stdout, stderr) => {
            if (!error) {
                execEmitter.emit('done');
            }
            else {
                execEmitter.emit('error', stdout, stderr);
            }
        });

    return execPromise;
}

/**
 * Compile a solidity contract with solc docker container
 * @param {string} contractPath Path of the contract, must be an absolute path
 * @param {string} outputDir Path of the output, must be an absolute path
 * @param {string} solc Solc config, if `solc` equals `docker`, use solc docker container to compile contract, otherwise use user-specified solc
 */
module.exports.compile = async function (contractPath, outputDir, solc = undefined) {
    assert(path.isAbsolute(contractPath), 'contract path must be an absolute path');
    assert(path.isAbsolute(outputDir), 'output directory must be an absolute path');

    if (solc) {
        return compileWithBin(contractPath, outputDir, solc);
    } else {
        return compileWithSolcJS(contractPath, outputDir);
    }
};

module.exports.decodeMethod = function (methodAbi, bytes) {
    return abi.decodeMethod(methodAbi, bytes);
};

module.exports.spliceFunctionSignature = function (abi) {
    let functionName = abi.name + '(';
    for (let index in abi.inputs) {
        functionName += abi.inputs[index].type;
        if (index != abi.inputs.length - 1) {
            functionName += ',';
        }
    }
    functionName += ')';
    return functionName;
};

module.exports.cleanHexPrefix = function (input) {
    if (input.startsWith('0x') || input.startsWith('0X')) {
        return input.substring(2);
    }
    return input;
};
