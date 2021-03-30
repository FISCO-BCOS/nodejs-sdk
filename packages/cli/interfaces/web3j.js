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

const path = require("path");
const fs = require("fs");
const decode = require("../../api/decoder");
const { produceSubCommandInfo, FLAGS, getAbi } = require("./base");
const {
    Web3jService,
    ConsensusService,
    SystemConfigService,
    CompileService,
    Configuration,
} = require("../../api");
const { CONTRACTS_OUTPUT_DIR } = require("../constant");
const { check, Str, Addr, Any } = require("../../api/common/typeCheck");

let interfaces = [];
const configFile = path.join(__dirname, "../conf/config.json");
const config = new Configuration(configFile);
const web3jService = new Web3jService(config);
const consensusService = new ConsensusService(config);
const systemConfigService = new SystemConfigService(config);
const compileService = new CompileService(config);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getBlockNumber",
            describe: "Query the number of most recent block",
        },
        () => {
            return web3jService.getBlockNumber().then((result) => {
                result.result = parseInt(result.result, "16").toString();
                return result;
            });
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getPbftView",
            describe: "Query the pbft view of node",
        },
        () => {
            return web3jService.getPbftView().then((result) => {
                result.result = parseInt(result.result, "16").toString();
                return result;
            });
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getObserverList",
            describe: "Query nodeId list for observer nodes",
        },
        () => {
            return web3jService.getObserverList();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getSealerList",
            describe: "Query nodeId list for sealer nodes",
        },
        () => {
            return web3jService.getSealerList();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getConsensusStatus",
            describe: "Query consensus status",
        },
        () => {
            return web3jService.getConsensusStatus();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getSyncStatus",
            describe: "Query sync status",
        },
        () => {
            return web3jService.getSyncStatus();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getClientVersion",
            describe: "Query the current node version",
        },
        () => {
            return web3jService.getClientVersion();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getPeers",
            describe: "Query peers currently connected to the client",
        },
        () => {
            return web3jService.getPeers();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getNodeIDList",
            describe: "Query nodeId list for all connected nodes",
        },
        () => {
            return web3jService.getNodeIDList();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getGroupPeers",
            describe: "Query nodeId list for sealer and observer nodes",
        },
        () => {
            return web3jService.getGroupPeers();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getGroupList",
            describe: "Query group list",
        },
        () => {
            return web3jService.getGroupList();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getBlockByHash",
            describe: "Query information about a block by hash",
            args: [
                {
                    name: "blockHash",
                    options: {
                        type: "string",
                        describe: "32 Bytes - The hash of a block",
                    },
                },
                {
                    name: "includeTransactions",
                    options: {
                        type: "boolean",
                        describe:
                            "If true it returns the full transaction objects, if false only the hashes of the transactions",
                        flag: FLAGS.OPTIONAL,
                        alias: "i",
                    },
                },
            ],
        },
        (argv) => {
            let blockHash = argv.blockHash;
            let includeTransactions = argv.includeTransactions || false;
            return web3jService.getBlockByHash(blockHash, includeTransactions);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getBlockByNumber",
            describe: "Query information about a block by block number",
            args: [
                {
                    name: "blockNumber",
                    options: {
                        type: "string",
                        describe: "Integer of a block number",
                    },
                },
                {
                    name: "includeTransactions",
                    options: {
                        type: "boolean",
                        describe:
                            "If true it returns the full transaction objects, if false only the hashes of the transactions",
                        flag: FLAGS.OPTIONAL,
                        alias: "i",
                    },
                },
            ],
        },
        (argv) => {
            let blockNumber = argv.blockNumber;
            let includeTransactions = argv.includeTransactions || false;
            return web3jService.getBlockByNumber(
                blockNumber,
                includeTransactions
            );
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getBlockHashByNumber",
            describe: "Query block hash by block number",
            args: [
                {
                    name: "blockNumber",
                    options: {
                        type: "string",
                        describe: "Integer of a block number",
                    },
                },
            ],
        },
        (argv) => {
            let blockNumber = argv.blockNumber;
            return web3jService.getBlockHashByNumber(blockNumber);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getTransactionByHash",
            describe:
                "Query information about a transaction requested by transaction hash",
            args: [
                {
                    name: "transactionHash",
                    options: {
                        type: "string",
                        describe: "32 Bytes - The hash of a transaction",
                    },
                },
            ],
        },
        (argv) => {
            let transactionHash = argv.transactionHash;
            return web3jService.getTransactionByHash(transactionHash);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getTransactionByBlockHashAndIndex",
            describe:
                "Query information about a transaction by block hash and transaction index position",
            args: [
                {
                    name: "blockHash",
                    options: {
                        type: "string",
                        describe: "32 Bytes - The hash of a transaction",
                    },
                },
                {
                    name: "index",
                    options: {
                        type: "string",
                        describe:
                            " Integer of a transaction index, from 0 to 2147483647",
                    },
                },
            ],
        },
        (argv) => {
            let blockHash = argv.blockHash;
            let index = argv.index;

            return web3jService.getTransactionByBlockHashAndIndex(
                blockHash,
                index
            );
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getTransactionByBlockNumberAndIndex",
            describe:
                "Query information about a transaction by block number and transaction index position",
            args: [
                {
                    name: "blockNumber",
                    options: {
                        type: "string",
                        describe:
                            "Integer of a block number, from 0 to 2147483647",
                    },
                },
                {
                    name: "index",
                    options: {
                        type: "string",
                        describe:
                            " Integer of a transaction index, from 0 to 2147483647",
                    },
                },
            ],
        },
        (argv) => {
            let blockNumber = argv.blockNumber;
            let index = argv.index;

            return web3jService.getTransactionByBlockNumberAndIndex(
                blockNumber,
                index
            );
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getPendingTransactions",
            describe: "Query pending transactions",
        },
        () => {
            return web3jService.getPendingTransactions();
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getPendingTxSize",
            describe: "Query pending transactions size",
        },
        () => {
            return web3jService.getPendingTxSize().then((result) => {
                result.result = parseInt(result.result, 16).toString();
                return result;
            });
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getTotalTransactionCount",
            describe: "Query total transaction count",
        },
        () => {
            return web3jService.getTotalTransactionCount().then((result) => {
                result.result.blockNumber = parseInt(
                    result.result.blockNumber,
                    16
                ).toString();
                result.result.failedTxSum = parseInt(
                    result.result.failedTxSum,
                    16
                ).toString();
                result.result.txSum = parseInt(
                    result.result.txSum,
                    16
                ).toString();
                return result;
            });
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getTransactionReceipt",
            describe: "Query the receipt of a transaction by transaction hash",
            args: [
                {
                    name: "transactionHash",
                    options: {
                        type: "string",
                        describe: "32 Bytes - The hash of a transaction",
                    },
                },
            ],
        },
        (argv) => {
            let txHash = argv.transactionHash;
            return web3jService.getTransactionReceipt(txHash);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "deploy",
            describe: "Deploy a contract written in Solidity or Liquid",
            args: [
                {
                    name: "contract",
                    options: {
                        type: "string",
                        describe: "The path of the contract",
                    },
                },
                {
                    name: "abi",
                    options: {
                        type: "string",
                        describe: "The path of the corresponding ABI file",
                        alias: "a",
                        flag: FLAGS.OPTIONAL,
                    },
                },
                {
                    name: "who",
                    options: {
                        type: "string",
                        describe: "Who will do this operation",
                        alias: "w",
                        flag: FLAGS.OPTIONAL,
                    },
                },
                {
                    name: "parameters",
                    options: {
                        type: "string",
                        describe:
                            "The parameters(split by space) of constructor",
                        flag: FLAGS.VARIADIC,
                    },
                },
            ],
        },
        (argv) => {
            let contractPath = argv.contract;
            if (!fs.existsSync(contractPath)) {
                throw new Error(`${contractPath} doesn't exist`);
            }

            let who = argv.who;
            let extname = path.extname(contractPath).toLowerCase();

            if (extname === ".sol") {
                if (argv.abi !== undefined) {
                    throw new Error("You don't need to provide ABI");
                }

                let contractClass = compileService.compile(contractPath);
                if (!fs.existsSync(CONTRACTS_OUTPUT_DIR)) {
                    fs.mkdirSync(CONTRACTS_OUTPUT_DIR);
                }

                let contractName = path.basename(contractPath);
                contractName = contractName.substring(
                    0,
                    contractName.indexOf(".")
                );
                let abiPath = path.join(
                    CONTRACTS_OUTPUT_DIR,
                    `${path.basename(contractName)}.abi`
                );
                let binPath = path.join(
                    CONTRACTS_OUTPUT_DIR,
                    `${path.basename(contractName)}.bin`
                );

                try {
                    fs.writeFileSync(
                        abiPath,
                        JSON.stringify(contractClass.abi)
                    );
                    fs.writeFileSync(binPath, contractClass.bin);
                } catch (error) {}

                let parameters = argv.parameters;
                return web3jService
                    .deploy(contractClass.abi, contractClass.bin, parameters, {
                        isSol: true,
                        who,
                    })
                    .then((result) => {
                        if (result.status === "0x0") {
                            let contractAddress = result.contractAddress;
                            let addressPath = path.join(
                                CONTRACTS_OUTPUT_DIR,
                                `.${path.basename(
                                    contractName,
                                    ".sol"
                                )}.address`
                            );

                            try {
                                fs.appendFileSync(
                                    addressPath,
                                    contractAddress + "\n"
                                );
                            } catch (error) {}

                            return {
                                status: result.status,
                                contractAddress,
                                transactionHash: result.transactionHash,
                            };
                        }

                        return {
                            status: result.status,
                            transactionHash: result.transactionHash,
                        };
                    });
            } else if (extname === ".wasm") {
                if (argv.abi === undefined) {
                    throw new Error(
                        "You need to provide ABI via `--abi` option"
                    );
                }

                let abiPath = argv.abi;
                if (!fs.existsSync(abiPath)) {
                    throw new Error(`${abiPath} doesn't exist`);
                }

                if (!fs.existsSync(CONTRACTS_OUTPUT_DIR)) {
                    fs.mkdirSync(CONTRACTS_OUTPUT_DIR);
                }

                let contractName = path.basename(contractPath, ".wasm");
                let copiedAbiPath = path.join(
                    CONTRACTS_OUTPUT_DIR,
                    `${contractName}.abi`
                );

                try {
                    fs.copyFileSync(abiPath, copiedAbiPath);
                } catch (error) {}

                let bin = fs.readFileSync(contractPath).toString("hex");
                let abi = JSON.parse(fs.readFileSync(abiPath).toString());
                let parameters = argv.parameters;

                return web3jService
                    .deploy(abi, bin, parameters, {
                        isSol: false,
                        who,
                    })
                    .then((result) => {
                        if (result.status === "0x0") {
                            let contractAddress = result.contractAddress;
                            let addressPath = path.join(
                                CONTRACTS_OUTPUT_DIR,
                                `.${contractName}.address`
                            );

                            try {
                                fs.appendFileSync(
                                    addressPath,
                                    contractAddress + "\n"
                                );
                            } catch (error) {}

                            return {
                                status: result.status,
                                contractAddress,
                                transactionHash: result.transactionHash,
                            };
                        }

                        return {
                            status: result.status,
                            transactionHash: result.transactionHash,
                        };
                    });
            } else {
                throw new Error(
                    `unknown contract type \`${extname}\`. For now, only \`.sol\` or \`.wasm\` are supported.`
                );
            }
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "call",
            describe: "Call a contract by a function and parameters",
            args: [
                {
                    name: "contractName",
                    options: {
                        type: "string",
                        describe: "The name of a contract",
                    },
                },
                {
                    name: "contractAddress",
                    options: {
                        type: "string",
                        describe: "20 Bytes - The address of a contract",
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
                    name: "who",
                    options: {
                        type: "string",
                        describe: "Who will do this operation",
                        flag: FLAGS.OPTIONAL,
                        alias: "w",
                    },
                },
                {
                    name: "parameters",
                    options: {
                        type: "string",
                        describe:
                            "The parameters(split by space) of a function",
                        flag: FLAGS.VARIADIC,
                    },
                },
            ],
        },
        (argv) => {
            let contractName = argv.contractName;
            let contractAddress = argv.contractAddress;
            let functionName = argv.function;
            let parameters = argv.parameters;
            let who = null;
            if (argv.who) {
                who = argv.who;
            }

            check(
                [contractName, contractAddress, functionName, parameters],
                Str,
                Addr,
                Str,
                Any
            );

            let inputsReg = /\(.*\)/;
            let inputs = inputsReg.exec(functionName);
            if (inputs) {
                inputs = inputs[0];
                inputs = inputs.substring(1, inputs.length - 1).split(",");
                inputs = inputs.map((input) => input.trim());
            }

            let pureFunctionName = functionName.replace(inputsReg, "");
            let abi = getAbi(contractName, pureFunctionName, inputs);

            if (!abi) {
                throw new Error(
                    `no ABI for method \`${functionName}\` of contract \`${contractName}\``
                );
            }

            let decoder = decode.createMethodDecoder(abi);

            if (abi.constant) {
                return web3jService
                    .call(contractAddress, abi, parameters, who)
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
                    .sendRawTransaction(contractAddress, abi, parameters, who)
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
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "addSealer",
            describe: "Add a sealer node",
            args: [
                {
                    name: "nodeID",
                    options: {
                        type: "string",
                        describe:
                            "The nodeId of a node. The length of the node hex string is 128",
                    },
                },
            ],
        },
        (argv) => {
            let nodeID = argv.nodeID;
            return consensusService.addSealer(nodeID);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "addObserver",
            describe: "Add an observer node",
            args: [
                {
                    name: "nodeID",
                    options: {
                        type: "string",
                        describe:
                            "The nodeId of a node. The length of the node hex string is 128",
                    },
                },
            ],
        },
        (argv) => {
            let nodeID = argv.nodeID;
            return consensusService.addObserver(nodeID);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "removeNode",
            describe: "Remove a node",
            args: [
                {
                    name: "nodeID",
                    options: {
                        type: "string",
                        describe:
                            "The nodeId of a node. The length of the node hex string is 128",
                    },
                },
            ],
        },
        (argv) => {
            let nodeID = argv.nodeID;
            return consensusService.removeNode(nodeID);
        }
    )
);

const systemKeys = [
    "tx_count_limit",
    "tx_gas_limit",
    "rpbft_epoch_block_num",
    "rpbft_epoch_sealer_num",
];

interfaces.push(
    produceSubCommandInfo(
        {
            name: "setSystemConfigByKey",
            describe: "Set a system config value by key",
            args: [
                {
                    name: "key",
                    options: {
                        type: "string",
                        describe: "The name of system config",
                        choices: systemKeys,
                    },
                },
                {
                    name: "value",
                    options: {
                        type: "string",
                        describe: "The value of system config to be set",
                    },
                },
            ],
        },
        (argv) => {
            let key = argv.key;
            let value = argv.value;

            return systemConfigService.setValueByKey(key, value);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getSystemConfigByKey",
            describe: "Query a system config value by key",
            args: [
                {
                    name: "key",
                    options: {
                        type: "string",
                        describe: "The name of system config",
                        choices: systemKeys,
                    },
                },
            ],
        },
        (argv) => {
            let key = argv.key;
            return web3jService.getSystemConfigByKey(key);
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "getCode",
            describe: "Query code at a given address",
            args: [
                {
                    name: "address",
                    options: {
                        type: "string",
                        describe: "20 Bytes - The address of a contract",
                    },
                },
            ],
        },
        (argv) => {
            let address = argv.address;
            return web3jService.getCode(address);
        }
    )
);

module.exports.interfaces = interfaces;
