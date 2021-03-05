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

const decode = require("../../api/decoder");
const path = require("path");
const fs = require("fs");
const { produceSubCommandInfo, FLAGS } = require("./base");
const {
    CNSService,
    PermissionService,
    Web3jService,
    CompileService,
    Configuration,
} = require("../../api");
const { OutputCode } = require("../../api/precompiled/common");
const { CONTRACTS_DIR } = require("../constant");

function checkVersion(version) {
    if (!version.match(/^[A-Za-z0-9.]+$/)) {
        return "contract version should only contains 'A-Z' or 'a-z' or '0-9' or dot mark";
    }

    return "";
}

let interfaces = [];
const configFile = path.join(__dirname, "../conf/config.json");
const config = new Configuration(configFile);
const cnsService = new CNSService(config);
const permissionService = new PermissionService(config);
const web3jService = new Web3jService(config);
const compileService = new CompileService(config);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "deployByCNS",
            describe: "Deploy a contract on blockchain by CNS",
            args: [
                {
                    name: "contract",
                    options: {
                        type: "string",
                        describe: "The path of a contract",
                    },
                },
                {
                    name: "contractVersion",
                    options: {
                        type: "string",
                        describe: "The version of the contract",
                    },
                },
                {
                    name: "who",
                    options: {
                        type: "string",
                        describe: "Who will do this operation",
                    },
                },
                {
                    name: "parameters",
                    options: {
                        type: "string",
                        describe:
                            "The parameters(splitted by space) of constructor",
                        flag: FLAGS.VARIADIC,
                    },
                },
            ],
        },
        (argv) => {
            return permissionService.listCNSManager().then((cnsManagers) => {
                let who = argv.who;

                if (!config.accounts.hasOwnProperty(who)) {
                    throw new Error(`invalid account: ${who}`);
                }
                let account = config.accounts[who].account;

                if (cnsManagers.length !== 0) {
                    if (
                        cnsManagers.findIndex(
                            (value) => value.address === account
                        ) < 0
                    ) {
                        throw new Error(
                            OutputCode.getOutputMessage(
                                OutputCode.PermissionDenied
                            )
                        );
                    }
                }

                let contract = argv.contract;
                let contractName = path.basename(contract);
                let dotPosition = contractName.lastIndexOf(".");
                let extname = contractName.substr(dotPosition);
                contractName = contractName.substr(0, dotPosition);
                let isSol = extname.toLowerCase() === ".sol" ? true : false;

                let version = argv.contractVersion;
                if (version) {
                    let checkResult = checkVersion(version);
                    if (checkResult !== "") {
                        throw new Error(checkResult);
                    }
                }

                return cnsService
                    .queryCnsByNameAndVersion(contractName, version)
                    .then((queryResult) => {
                        if (queryResult.length !== 0) {
                            throw new Error(
                                OutputCode.getOutputMessage(
                                    OutputCode.ContractNameAndVersionExist
                                )
                            );
                        }

                        if (!fs.existsSync(contract)) {
                            throw new Error(`${contract} doesn't exist`);
                        }

                        let contractClass = compileService.compile(contract);
                        let parameters = argv.parameters;

                        return web3jService
                            .deploy(
                                contractClass.abi,
                                contractClass.bin,
                                parameters,
                                {
                                    isSol,
                                    account,
                                }
                            )
                            .then((result) => {
                                if (result.status === "0x0") {
                                    let contractAddress =
                                        result.contractAddress;
                                    return cnsService
                                        .registerCns(
                                            contractName,
                                            version,
                                            contractAddress,
                                            JSON.stringify(contractClass.abi)
                                        )
                                        .then(() => {
                                            return {
                                                status: result.status,
                                                contractAddress,
                                                transactionHash:
                                                    result.transactionHash,
                                            };
                                        });
                                } else {
                                    return {
                                        status: result.status,
                                        transactionHash: result.transactionHash,
                                    };
                                }
                            });
                    });
            });
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "queryCNS",
            describe:
                "Query CNS information by contract name and contract version",
            args: [
                {
                    name: "contractName",
                    options: {
                        type: "string",
                        describe: "The name of a contract",
                    },
                },
                {
                    name: "contractVersion",
                    options: {
                        type: "string",
                        describe: "The version of a contract",
                        flag: FLAGS.OPTIONAL,
                        alias: "v",
                    },
                },
            ],
        },
        (argv) => {
            let contractName = argv.contractName;
            if (argv.contractVersion) {
                let contractVersion = argv.contractVersion;
                let checkResult = checkVersion(contractVersion);
                if (checkResult !== "") {
                    throw new Error(checkResult);
                }
                return cnsService.queryCnsByNameAndVersion(
                    contractName,
                    contractVersion
                );
            } else {
                return cnsService.queryCnsByName(contractName);
            }
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "callByCNS",
            describe: "Call a contract by a function and parameters by CNS",
            args: [
                {
                    name: "contractName:contractVersion",
                    options: {
                        type: "string",
                        describe:
                            "The name and version of a contract. If contract version is not provided, then the latest version of contract will be called",
                    },
                },
                {
                    name: "function",
                    options: {
                        type: "string",
                        describe: "The function of a contract",
                    },
                },
                {
                    name: "parameters",
                    options: {
                        type: "string",
                        describe:
                            "The parameters(splited by space) of a function",
                        default: [],
                        flag: FLAGS.VARIADIC,
                    },
                },
            ],
        },
        (argv) => {
            let contractNameAndVersion = argv["contractName:contractVersion"];
            let contractName = null;
            let contractVersion = null;

            if (contractNameAndVersion.includes(":")) {
                let fields = contractNameAndVersion.split(":");
                if (fields.length > 2) {
                    throw new Error(
                        "contract name and version has incorrect format. For example, contractName:contractVersion"
                    );
                } else {
                    contractName = fields[0].trim();
                    contractVersion = fields[1].trim();
                }
            } else {
                contractName = contractNameAndVersion;
            }

            contractName = path.basename(contractName, ".sol");
            if (contractVersion) {
                let checkResult = checkVersion(contractVersion);
                if (checkResult !== "") {
                    throw new Error(checkResult);
                }
                contractNameAndVersion = contractName + ":" + contractVersion;
            } else {
                contractNameAndVersion = contractName;
            }

            return cnsService
                .getAddressByContractNameAndVersion(contractNameAndVersion)
                .then((addressInfo) => {
                    let address = addressInfo.address;
                    let abi = null;
                    try {
                        abi = JSON.parse(addressInfo.abi);
                        if (!abi) {
                            throw new Error(
                                `no abi for contract ${contractName}`
                            );
                        }
                    } catch (error) {
                        throw new Error(`no abi for contract ${contractName}`);
                    }

                    let functionName = argv.function;
                    let decoder = decode.createMethodDecoder(abi, functionName);
                    let parameters = argv.parameters;
                    abi = abi.find((item) => {
                        return (
                            item.type === "function" &&
                            item.name === functionName
                        );
                    });

                    if (abi.constant) {
                        return web3jService
                            .call(address, abi, parameters)
                            .then((result) => {
                                let status = result.result.status;
                                let ret = {
                                    status: status,
                                    output: null,
                                };
                                let output = result.result.output;
                                if (output !== "0x") {
                                    ret.output = decoder.decodeOutput(
                                        output,
                                        status === "0x16"
                                    );
                                }
                                return ret;
                            });
                    } else {
                        return web3jService
                            .sendRawTransaction(address, abi, parameters)
                            .then((result) => {
                                let txHash = result.transactionHash;
                                let status = result.status;
                                let ret = {
                                    transactionHash: txHash,
                                    status: status,
                                    output: null,
                                };
                                let output = result.output;
                                if (output !== "0x") {
                                    ret.output = decoder.decodeOutput(
                                        output,
                                        status === "0x16"
                                    );
                                }
                                return ret;
                            });
                    }
                });
        }
    )
);

module.exports.interfaces = interfaces;
