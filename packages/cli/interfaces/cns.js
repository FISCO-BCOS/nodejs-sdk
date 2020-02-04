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

const decode = require('../../api/decoder');
const path = require('path');
const fs = require('fs');
const { produceSubCommandInfo, FLAGS } = require('./base');
const { CNSService, PermissionService, Web3jService } = require('../../api');
const OutputCode = require('../../api/precompiled/common').OutputCode;
const { ContractsDir, ContractsOutputDir } = require('../constant');

function checkVersion(version) {
    if (!version.match(/^[A-Za-z0-9.]+$/)) {
        return "contract version should only contains 'A-Z' or 'a-z' or '0-9' or dot mark";
    }

    return '';
}

let interfaces = [];
let cnsService = new CNSService();
let permissionService = new PermissionService();
let web3jService = new Web3jService();


interfaces.push(produceSubCommandInfo(
    {
        name: 'deployByCNS',
        describe: 'Deploy a contract on blockchain by CNS',
        args: [
            {
                name: 'contractName',
                options: {
                    type: 'string',
                    describe: 'The name of a contract'
                }
            },
            {
                name: 'contractVersion',
                options: {
                    type: 'string',
                    describe: 'The version of a contract'
                }
            },
            {
                name: 'parameters',
                options: {
                    type: 'string',
                    describe: 'The parameters(splited by a space) of a function',
                    flag: FLAGS.VARIADIC
                }
            }
        ]
    },
    (argv) => {
        return permissionService.listCNSManager().then(cnsManagers => {
            const Configuration = require('../../api/common/configuration').Configuration;
            if (cnsManagers.length !== 0 && cnsManagers.findIndex(value => value.address === Configuration.getInstance().account) < 0) {
                throw new Error(OutputCode.getOutputMessage(OutputCode.PermissionDenied));
            }

            let contractName = path.basename(argv.contractName, '.sol');
            let contractVersion = argv.contractVersion;
            if (contractVersion) {
                let checkResult = checkVersion(contractVersion);
                if (checkResult !== '') {
                    throw new Error(checkResult);
                }
            }

            return cnsService.queryCnsByNameAndVersion(contractName, contractVersion).then(queryResult => {
                if (queryResult.length !== 0) {
                    throw new Error(OutputCode.getOutputMessage(OutputCode.ContractNameAndVersionExist));
                }

                let contractPath = path.join(ContractsDir, contractName + '.sol');
                if (!fs.existsSync(contractPath)) {
                    throw new Error(`${contractName} doesn't exist`);
                }
                let outputDir = ContractsOutputDir;

                let parameters = argv.parameters;
                return web3jService.deploy(contractPath, outputDir, parameters).then(result => {
                    if (result.status === '0x0') {
                        let contractAddress = result.contractAddress;
                        let abi = fs.readFileSync(path.join(outputDir, `${contractName}.abi`)).toString();
                        cnsService.registerCns(contractName, contractVersion, contractAddress, abi);
                        return { status: result.status, contractAddress: contractAddress, transactionHash: result.transactionHash };
                    } else {
                        return { status: result.status, transactionHash: result.transactionHash };
                    }
                });
            });

        });
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'queryCNS',
        describe: 'Query CNS information by contract name and contract version',
        args: [
            {
                name: 'contractName',
                options: {
                    type: 'string',
                    describe: 'The name of a contract'
                }
            },
            {
                name: 'contractVersion',
                options: {
                    type: 'string',
                    describe: 'The version of a contract',
                    flag: FLAGS.OPTIONAL
                }
            }
        ]
    },
    (argv) => {
        let contractName = argv.contractName;
        if (argv.contractVersion) {
            let contractVersion = argv.contractVersion;
            let checkResult = checkVersion(contractVersion);
            if (checkResult !== '') {
                throw new Error(checkResult);
            }
            return cnsService.queryCnsByNameAndVersion(contractName, contractVersion);
        } else {
            return cnsService.queryCnsByName(contractName);
        }
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'callByCNS',
        describe: 'Call a contract by a function and parameters by CNS',
        args: [
            {
                name: 'contractName:contractVersion',
                options: {
                    type: 'string',
                    describe: 'The name and version of a contract. If contract version is not provided, then the latest version of contract will be called'
                }
            },
            {
                name: 'function',
                options: {
                    type: 'string',
                    describe: 'The function of a contract'
                }
            },
            {
                name: 'parameters',
                options: {
                    type: 'string',
                    describe: 'The parameters(splited by a space) of a function',
                    default: [],
                    flag: FLAGS.VARIADIC
                }
            }
        ]
    },
    (argv) => {
        let contractNameAndVersion = argv['contractName:contractVersion'];
        let contractName = null;
        let contractVersion = null;

        if (contractNameAndVersion.includes(':')) {
            let fields = contractNameAndVersion.split(':');
            if (fields.length > 2) {
                throw new Error('contract name and version has incorrect format. For example, contractName:contractVersion');
            } else {
                contractName = fields[0].trim();
                contractVersion = fields[1].trim();
            }
        } else {
            contractName = contractNameAndVersion;
        }

        contractName = path.basename(contractName, '.sol');
        if (contractVersion) {
            let checkResult = checkVersion(contractVersion);
            if (checkResult !== '') {
                throw new Error(checkResult);
            }
            contractNameAndVersion = contractName + ':' + contractVersion;
        } else {
            contractNameAndVersion = contractName;
        }

        return cnsService.getAddressByContractNameAndVersion(contractNameAndVersion).then(addressInfo => {
            let address = addressInfo.address;
            let abi = null;
            try {
                abi = JSON.parse(addressInfo.abi);
                if (!abi) {
                    throw new Error(`no abi for contract ${contractName}`);
                }
            } catch (error) {
                throw new Error(`no abi for contract ${contractName}`);
            }

            let functionName = argv.function;
            let decoder = decode.createDecoder(abi, functionName);
            let parameters = argv.parameters;
            abi = abi.find(item => {
                return item.type === 'function' && item.name === functionName;
            });

            if (abi.constant) {
                return web3jService.call(address, abi, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = decoder.decodeOutput(output);
                    }
                    return ret;
                });
            } else {
                return web3jService.sendRawTransaction(address, abi, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = decoder.decodeOutput(output);
                    }
                    return ret;
                });
            }
        });
    }
));

module.exports.interfaces = interfaces;
