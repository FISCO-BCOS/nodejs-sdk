/*jshint esversion: 8 */
/*jshint node: true */

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

const path = require('path');
const fs = require('fs');
const os = require('os');
const semver = require('semver');
const events = require('events');
const childProcess = require('child_process');
const uuid = require('uuid');
const CompileError = require('../common/exceptions').CompileError;
const createContractClass = require('./contractClass').createContractClass;

let solc0$4Ver;
let solc0$5Ver;
let solc0$4GmVer = '0.4.25';

try {
    solc0$4Ver = require('./compilers/solc-0.4/node_modules/solc/package.json').version;
    solc0$5Ver = require('./compilers/solc-0.5/node_modules/solc/package.json').version;
} catch (e) {
    throw new CompileError('solc is not installed yet');
}

function checkContractError(errors, version = '0.4') {
    // Standard error types of solcjs
    var solcErrors = [
        'JSONError',
        'IOError',
        'ParserError',
        'DocstringParsingError',
        'SyntaxError',
        'DeclarationError',
        'TypeError',
        'UnimplementedFeatureError',
        'InternalCompilerError',
        'Exception',
        'CompilerError',
        'FatalError'
    ];

    if (!errors) {
        return;
    } else {
        let errorMsgs = [];
        errors.forEach((error, index) => {
            let lineNo, level, msg;
            switch (version) {
                case '0.4':
                    [lineNo, level, msg] = error.split(': ');
                    if (solcErrors.includes(level)) {
                        errorMsgs.push(`${index + 1}> ${error}`);
                    }
                    break;
                case '0.5':
                    level = error.type;
                    if (solcErrors.includes(level)) {
                        errorMsgs.push(`${index + 1}> ${error.formattedMessage}`);
                    }
            }
        });

        if (errorMsgs.length !== 0) {
            throw new CompileError('\n' + errorMsgs.join('').trim());
        }
        return;
    }
}

function checkContractLength(bin) {
    if (bin.length && bin.length <= 0x40000) {
        return;
    }
    throw new CompileError(`illegal contract bin size, expected (0, 0x40000(256K)] but got ${bin.length}`);
}

// Used by compileWithSolcJS only
function compileWithSolc0$4(solc, contractName, contractContent, readCallback) {
    let input = {
        sources: {
            [contractName]: contractContent
        }
    };

    let output = solc.compile(input, 1, readCallback);
    checkContractError(output.errors);

    let qulifiedContractName = `${contractName}:${contractName}`;
    if (!output.contracts[qulifiedContractName]) {
        let existKeys = [];
        for (let key in output.contracts) {
            if (output.contracts.hasOwnProperty(key)) {
                existKeys.push(key.split(':')[1]);
            }
        }
        throw new CompileError(`no contract found with name ${contractName}, only contracts named [${existKeys.join(', ')}] found`);
    }

    let abi = output.contracts[`${contractName}:${contractName}`].interface;
    let bin = output.contracts[`${contractName}:${contractName}`].bytecode;

    return createContractClass(contractName, abi, bin);
}

function compileWithSolcJS(contractPath) {
    let contractName = path.basename(contractPath, '.sol');

    let contractContent = fs.readFileSync(contractPath).toString();
    let solcVerReg = /pragma\s+solidity\s*(.*)\s*;/;
    let requiredSolcVer = solcVerReg.exec(contractContent)[1] || null;

    if (requiredSolcVer === null) {
        throw new CompileError("solc version can't be determined");
    }
    let requiredSolcVerRange = semver.validRange(requiredSolcVer);

    let readCallback = (importContractName) => {
        let importContractPath = path.join(path.dirname(contractPath), importContractName);
        return { contents: fs.readFileSync(importContractPath).toString() };
    };

    const { Configuration, ECDSA, SM_CRYPTO } = require('../common/configuration');
    let encryptType = Configuration.getInstance().encryptType;
    if (encryptType === ECDSA) {
        if (semver.satisfies(solc0$5Ver, requiredSolcVerRange)) {
            let solc = require('./compilers/solc-0.5');
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
            let output = JSON.parse(solc.compile(JSON.stringify(input), readCallback));
            checkContractError(output.errors, '0.5');

            if (!output.contracts[contractName][contractName]) {
                let existKeys = [];
                for (let key in output.contracts[contractName]) {
                    if (output.contracts[contractName].hasOwnProperty(key)) {
                        existKeys.push(key);
                    }
                }
                throw new CompileError(`no contract found with name ${contractName}, only contracts named [${existKeys.join(', ')}] found`);
            }

            let abi = output.contracts[contractName][contractName].abi;
            let bin = output.contracts[contractName][contractName].evm.bytecode.object;
            return createContractClass(contractName, abi, bin);
        } else if (semver.satisfies(solc0$4Ver, requiredSolcVerRange)) {
            let solc = require('./compilers/solc-0.4');
            return compileWithSolc0$4(solc, contractName, contractContent, readCallback);
        } else {
            throw new CompileError("solc version can't be satisfied");
        }
    } else if (encryptType === SM_CRYPTO) {
        if (semver.satisfies(solc0$4GmVer, requiredSolcVerRange)) {
            let wrapper = require('./compilers/solc-0.4/node_modules/solc/wrapper');
            let solc = wrapper(require('./compilers/gm/soljson-v0.4.25-gm'));

            return compileWithSolc0$4(solc, contractName, contractContent, readCallback);
        } else {
            throw new CompileError("solc version can't be satisfied");
        }
    } else {
        throw new CompileError("solc version can't be satisfied");
    }
}

function compileWithBin(contractPath, solc) {
    let outputDir = path.join(os.tmpdir(), uuid.v4());
    let cmd = `${solc} --overwrite --abi --bin -o ${outputDir} ${contractPath} 2>&1`;

    let output = null;
    try {
        output = childProcess.execSync(cmd).toString();
    } catch (error) {
        throw new CompileError(error.message);
    }

    let contractName = path.basename(contractPath, '.sol');
    let files = fs.readdirSync(outputDir);

    let abiIndex = files.findIndex((file) => { return file.endsWith(contractName + '.abi'); });
    let binIndex = files.findIndex((file) => { return file.endsWith(contractName + '.bin'); });
    if (abiIndex === -1 || binIndex === -1) {
        throw new CompileError('\n' + output.trim());
    }

    let abi = fs.readFileSync(path.join(outputDir, files[abiIndex])).toString();
    let bin = fs.readFileSync(path.join(outputDir, files[binIndex])).toString();
    checkContractLength(bin);

    return createContractClass(contractName, abi, bin);
}

/**
 * Compile a solidity contract with solc docker container
 * @param {string} contractPath Path of the contract
 * @param {string} solc Solc config, use user-specified solc
 */
module.exports.compile = function (contractPath, solc = undefined) {
    if (solc) {
        return compileWithBin(contractPath, solc);
    } else {
        return compileWithSolcJS(contractPath);
    }
};