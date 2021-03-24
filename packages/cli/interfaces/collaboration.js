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

const path = require("path");
const fs = require("fs");
const {
    Configuration,
    Web3Sync,
    getBlockHeight,
    Web3jService,
    CNSService,
    hash,
} = require("../../api");
const { produceSubCommandInfo, FLAGS } = require("./base");
const isArray = require("isarray");
const ScaleCodec = require("../scale_codec");
const { exception } = require("console");
const { encodeParams } = require("../../api/common/web3lib/web3sync");

let interfaces = [];
const configFile = path.join(__dirname, "../conf/config.json");
const config = new Configuration(configFile);
const web3jService = new Web3jService(config);
const cnsService = new CNSService(config);

function encode(data, abi) {
    if (abi.type === "uint8") {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        return ScaleCodec.encodeU8(data);
    }

    if (abi.type === "uint16") {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        return ScaleCodec.encodeU16(data);
    }

    if (abi.type === "uint32") {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        return ScaleCodec.encodeU32(data);
    }

    if (abi.type === "int8") {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        return ScaleCodec.encodeI8(data);
    }

    if (abi.type === "int16") {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        return ScaleCodec.encodeI16(data);
    }

    if (abi.type === "int32") {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        return ScaleCodec.encodeI32(data);
    }

    if (abi.type === "bool") {
        if (data === "true") {
            return ScaleCodec.encodeBool(true);
        } else if (data === "false") {
            return ScaleCodec.encodeBool(false);
        } else {
            throw Error(`invalid representation of boolean: ${data}`);
        }
    }

    if (abi.type === "address") {
        return ScaleCodec.encodeAddress(data);
    }

    if (abi.type === "string") {
        return ScaleCodec.encodeString(data);
    }

    if (abi.type === "struct") {
        let encoded = Buffer.alloc(0);
        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        let components = abi.components;
        components.forEach((component) => {
            if (data[component.name] == "undefined") {
                throw Error(
                    `no field named ${component.name} in data: ${data}`
                );
            }
            let encodedComponent = encode(data[component.name], component);
            encoded = Buffer.concat([encoded, encodedComponent]);
        });
        return encoded;
    }

    if (abi.type.endsWith("[]")) {
        abi.type = abi.type.substring(0, abi.type.length - 2);
        if (typeof data === "string") {
            data = JSON.parse(data);
        }

        let len = data.length;
        let encoded = ScaleCodec.encodeCompact(len);
        data.forEach((item) => {
            let encodedItem = encode(item, abi);
            encoded = Buffer.concat([encoded, encodedItem]);
        });
        return encoded;
    }

    throw Error(`unsupported type: ${abi.type}`);
}

function decode(data, abi) {
    if (abi.type === "uint8") {
        return ScaleCodec.decodeU8(data);
    }

    if (abi.type === "uint16") {
        return ScaleCodec.decodeU16(data);
    }

    if (abi.type === "uint32") {
        return ScaleCodec.decodeU32(data);
    }

    if (abi.type === "int8") {
        return ScaleCodec.decodeI8(data);
    }

    if (abi.type === "int16") {
        return ScaleCodec.decodeI16(data);
    }

    if (abi.type === "int32") {
        return ScaleCodec.decodeI32(data);
    }

    if (abi.type === "bool") {
        return ScaleCodec.decodeBool(data);
    }

    if (abi.type === "address") {
        return ScaleCodec.decodeAddress(data);
    }

    if (abi.type === "string") {
        return ScaleCodec.decodeString(data);
    }

    if (abi.type === "struct") {
        let decoded = {};
        let components = abi.components;
        take = 0;
        components.forEach((component) => {
            let name = component.name;
            let decode_result = decode(data, component);
            data = data.slice(decode_result.take);
            take += decode_result.take;
            decoded[name] = decode_result.data;
        });
        return {
            data: decoded,
            take,
        };
    }

    if (abi.type.endsWith("[]")) {
        abi.type = abi.type.substring(0, abi.type.length - 2);
        let take = 0;
        let decode_result = ScaleCodec.decodeCompact(data);
        let len = decode_result.data;
        data = data.slice(decode_result.take);
        take += decode_result.take;
        let decoded = [];
        for (let i = 0; i < len; ++i) {
            let decode_result = decode(data, abi);
            data = data.slice(decode_result.take);
            take += decode_result.take;
            decoded.push(decode_result.data);
        }
        return {
            data: decoded,
            take,
        };
    }

    throw Error(`unsupported type: ${abi.type}`);
}

interfaces.push(
    produceSubCommandInfo(
        {
            name: "initialize",
            describe: "Initialize a collaboration on blockchain",
            args: [
                {
                    name: "bin",
                    options: {
                        type: "string",
                        describe: "The path of contract template",
                    },
                },
                {
                    name: "abi",
                    options: {
                        type: "string",
                        describe: "the path of corresponding ABI",
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
            ],
        },
        (argv) => {
            let binPath = argv.bin;
            if (!fs.existsSync(binPath)) {
                throw new Error(`${binPath} doesn't exist`);
            }
            let bin = "0x" + fs.readFileSync(binPath).toString("hex");

            let abiPath = argv.abi;
            if (!fs.existsSync(abiPath)) {
                throw new Error(`${abiPath} doesn't exist`);
            }
            let contractABIs = JSON.parse(fs.readFileSync(abiPath).toString());
            if (!isArray(contractABIs)) {
                throw new Error("invalid ABI");
            }

            let params = ScaleCodec.encodeCompact(contractABIs.length);
            for (let contractABI of contractABIs) {
                let abi = ScaleCodec.encodeString(JSON.stringify(contractABI));
                params = Buffer.concat([params, abi]);
            }
            params = "0x" + params.toString("hex");

            let who = argv.who;
            let accountKey = who;
            if (!who) {
                accountKey = Object.keys(config.accounts)[0];
            } else {
                if (!config.accounts[accountKey]) {
                    throw new Error(`invalid id of account: ${who}`);
                }
            }

            let groupID = config.groupID;
            let privateKey = config.accounts[accountKey].privateKey;
            let account = config.accounts[accountKey].account;
            let chainID = config.chainID;
            let encryptType = config.encryptType;

            return getBlockHeight(config).then((blockHeight) => {
                let blockLimit = blockHeight + 500;
                let postdata = {
                    data: bin,
                    from: account,
                    to: null,
                    gas: 1000000,
                    randomid: Web3Sync.genRandomID(),
                    blockLimit: blockLimit,
                    chainId: chainID,
                    groupId: groupID,
                    extraData: params,
                };
                let signedTx = Web3Sync.signTransaction(
                    postdata,
                    privateKey,
                    encryptType,
                    null
                );
                return web3jService
                    .sendRawTransaction(signedTx)
                    .then((result) => {
                        if (result.status === "0x0") {
                            return {
                                status: result.status,
                                transactionHash: result.transactionHash,
                            };
                        }

                        if (result.status === "0x16") {
                            let output = result.output;
                            let buffer = Buffer.from(
                                output.substring(2),
                                "hex"
                            );
                            return {
                                status: result.status,
                                message: ScaleCodec.decodeString(buffer).data,
                                transactionHash: result.transactionHash,
                            };
                        } else {
                            return {
                                status: result.status,
                                transactionHash: result.transactionHash,
                            };
                        }
                    });
            });
        }
    )
);

interfaces.push(
    produceSubCommandInfo(
        {
            name: "sign",
            describe: "Sign a contract",
            args: [
                {
                    name: "contractName",
                    options: {
                        type: "string",
                        describe: "The name of the contract",
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
                            "The parameters(split by space) of the contract",
                        flag: FLAGS.VARIADIC,
                    },
                },
            ],
        },
        (argv) => {
            let who = argv.who;
            let accountKey = who;
            if (!who) {
                accountKey = Object.keys(config.accounts)[0];
            } else {
                if (!config.accounts[accountKey]) {
                    throw new Error(`invalid id of account: ${who}`);
                }
            }

            let contractName = argv.contractName;
            let parameters = argv.parameters;
            return cnsService
                .queryCnsByNameAndVersion(contractName, "collaboration")
                .then((contractInfo) => {
                    if (contractInfo.length != 1) {
                        throw new Error(
                            `the contract is not exist: ${contractName}`
                        );
                    }

                    contractInfo = contractInfo[0];
                    let name = contractInfo.name;
                    if (name != contractName) {
                        throw new Error(
                            `contract name is not match: the provided is "${contractName}" but the remote is ${name}`
                        );
                    }
                    let address = contractInfo.address;
                    let abi = JSON.parse(contractInfo.abi);
                    let ctorABI = abi.data;
                    let encodedParams = Buffer.alloc(0);
                    ctorABI.forEach((inputABI, index) => {
                        let encodedInput = encode(parameters[index], inputABI);
                        encodedParams = Buffer.concat([
                            encodedParams,
                            encodedInput,
                        ]);
                    });
                    let selector = hash(contractName, config.encryptType).slice(
                        0,
                        8
                    );
                    selector = Buffer.from(selector, "hex");
                    encodedParams = Buffer.concat([selector, encodedParams]);
                    encodedParams = "0x" + encodedParams.toString("hex");

                    let groupID = config.groupID;
                    let account = config.accounts[accountKey].account;
                    let privateKey = config.accounts[accountKey].privateKey;
                    let chainID = config.chainID;
                    let encryptType = config.encryptType;

                    return getBlockHeight(config).then((blockHeight) => {
                        let blockLimit = blockHeight + 500;
                        let postdata = {
                            data: encodedParams,
                            from: account,
                            to: address,
                            gas: 1000000,
                            randomid: Web3Sync.genRandomID(),
                            blockLimit: blockLimit,
                            chainId: chainID,
                            groupId: groupID,
                            extraData: "0x0",
                        };
                        let signedTx = Web3Sync.signTransaction(
                            postdata,
                            privateKey,
                            encryptType,
                            null
                        );
                        return web3jService
                            .sendRawTransaction(signedTx)
                            .then((result) => {
                                if (result.status === "0x0") {
                                    let buffer = Buffer.from(
                                        result.output.substring(2),
                                        "hex"
                                    );
                                    let contractId = ScaleCodec.decodeU32(
                                        buffer
                                    ).data;
                                    return {
                                        status: result.status,
                                        contractId,
                                        transactionHash: result.transactionHash,
                                    };
                                }

                                if (result.status === "0x16") {
                                    let output = result.output;
                                    let buffer = Buffer.from(
                                        output.substring(2),
                                        "hex"
                                    );
                                    return {
                                        status: result.status,
                                        message: ScaleCodec.decodeString(buffer)
                                            .data,
                                        transactionHash: result.transactionHash,
                                    };
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
            name: "exercise",
            describe: "Exercise an right of a contract",
            args: [
                {
                    name: "contract",
                    options: {
                        type: "string",
                        describe:
                            "The name and ID(split by `#`) of the exercised contract",
                    },
                },
                {
                    name: "rightName",
                    options: {
                        type: "string",
                        describe: "The name of the exercised right",
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
                            "The parameters(split by space) of the contract",
                        flag: FLAGS.VARIADIC,
                    },
                },
            ],
        },
        (argv) => {
            let who = argv.who;
            let accountKey = who;
            if (!who) {
                accountKey = Object.keys(config.accounts)[0];
            } else {
                if (!config.accounts[accountKey]) {
                    throw new Error(`invalid id of account: ${who}`);
                }
            }

            let items = argv.contract.split("#");
            if (items.length != 2) {
                throw new Error("invalid format of contract");
            }

            let contractName = items[0];
            contractId = parseInt(items[1]);
            if (isNaN(contractId)) {
                throw new Error(`invalid contract id: ${argv.contractId}`);
            }
            let rightName = argv.rightName;
            let parameters = argv.parameters;
            return cnsService
                .queryCnsByNameAndVersion(contractName, "collaboration")
                .then((contractInfo) => {
                    if (contractInfo.length != 1) {
                        throw new Error(
                            `the contract is not exist: ${contractName}`
                        );
                    }

                    contractInfo = contractInfo[0];
                    let name = contractInfo.name;
                    if (name != contractName) {
                        throw new Error(
                            `contract name is not match: the provided is "${contractName}" but the remote is ${name}`
                        );
                    }
                    let address = contractInfo.address;
                    let rights = JSON.parse(contractInfo.abi).rights;
                    if (rights.length === 0) {
                        throw new Error(`the contract has no rights`);
                    }

                    let right = rights.findIndex(
                        (right) => right.name == rightName
                    );
                    if (right === -1) {
                        throw new Error(`no right named as: ${rightName}`);
                    }
                    right = rights[right];

                    let inputABIs = right.inputs;
                    let encodedParams = ScaleCodec.encodeU32(contractId);
                    inputABIs.forEach((inputABI, index) => {
                        let encodedInput = encode(parameters[index], inputABI);
                        encodedParams = Buffer.concat([
                            encodedParams,
                            encodedInput,
                        ]);
                    });
                    let selector = hash(
                        `${contractName}(${rightName})`,
                        config.encryptType
                    ).slice(0, 8);
                    selector = Buffer.from(selector, "hex");
                    encodedParams = Buffer.concat([selector, encodedParams]);
                    encodedParams = "0x" + encodedParams.toString("hex");

                    let groupID = config.groupID;
                    let account = config.accounts[accountKey].account;
                    let privateKey = config.accounts[accountKey].privateKey;
                    let chainID = config.chainID;
                    let encryptType = config.encryptType;

                    return getBlockHeight(config).then((blockHeight) => {
                        let blockLimit = blockHeight + 500;
                        let postdata = {
                            data: encodedParams,
                            from: account,
                            to: address,
                            gas: 1000000,
                            randomid: Web3Sync.genRandomID(),
                            blockLimit: blockLimit,
                            chainId: chainID,
                            groupId: groupID,
                            extraData: "0x0",
                        };
                        let signedTx = Web3Sync.signTransaction(
                            postdata,
                            privateKey,
                            encryptType,
                            null
                        );
                        return web3jService
                            .sendRawTransaction(signedTx)
                            .then((result) => {
                                if (result.status === "0x0") {
                                    let data = Buffer.from(
                                        result.output.substring(2),
                                        "hex"
                                    );
                                    let outputABIs = right.outputs;
                                    let outputs = [];
                                    outputABIs.forEach((outputABI) => {
                                        let decode_result = decode(
                                            data,
                                            outputABI
                                        );
                                        data = data.slice(decode_result.take);
                                        outputs.push(decode_result.data);
                                    });
                                    return {
                                        status: result.status,
                                        outputs,
                                        transactionHash: result.transactionHash,
                                    };
                                }

                                if (result.status === "0x16") {
                                    let output = result.output;
                                    let buffer = Buffer.from(
                                        output.substring(2),
                                        "hex"
                                    );
                                    return {
                                        status: result.status,
                                        message: ScaleCodec.decodeString(buffer)
                                            .data,
                                        transactionHash: result.transactionHash,
                                    };
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
            name: "fetch",
            describe: "Fetch a contract",
            args: [
                {
                    name: "contract",
                    options: {
                        type: "string",
                        describe:
                            "The name and ID(split by `#`) of the exercised contract",
                    },
                },
            ],
        },
        (argv) => {
            let items = argv.contract.split("#");
            if (items.length != 2) {
                throw new Error("invalid format of contract");
            }

            let contractName = items[0];
            contractId = parseInt(items[1]);
            if (isNaN(contractId)) {
                throw new Error(`invalid contract id: ${argv.contractId}`);
            }
            return cnsService
                .queryCnsByNameAndVersion(contractName, "collaboration")
                .then((contractInfo) => {
                    if (contractInfo.length != 1) {
                        throw new Error(
                            `the contract is not exist: ${contractName}`
                        );
                    }

                    contractInfo = contractInfo[0];
                    let name = contractInfo.name;
                    if (name != contractName) {
                        throw new Error(
                            `contract name is not match: the provided is "${contractName}" but the remote is ${name}`
                        );
                    }
                    let address = contractInfo.address;
                    let abi = JSON.parse(contractInfo.abi);
                    let outputABI = {
                        type: "struct",
                        components: abi.data,
                    };
                    let selector =
                        "0x" +
                        hash(`$${contractName}`, config.encryptType).slice(
                            0,
                            8
                        );
                    let encodedParams =
                        selector +
                        ScaleCodec.encodeU32(contractId).toString("hex");

                    let groupID = config.groupID;
                    let account_key = Object.keys(config.accounts)[0];
                    let account = config.accounts[account_key].account;
                    let privateKey = config.accounts[account_key].privateKey;
                    let chainID = config.chainID;
                    let encryptType = config.encryptType;

                    return getBlockHeight(config).then((blockHeight) => {
                        let blockLimit = blockHeight + 500;
                        let postdata = {
                            data: encodedParams,
                            from: account,
                            to: address,
                            gas: 1000000,
                            randomid: Web3Sync.genRandomID(),
                            blockLimit: blockLimit,
                            chainId: chainID,
                            groupId: groupID,
                            extraData: "0x0",
                        };
                        let signedTx = Web3Sync.signTransaction(
                            postdata,
                            privateKey,
                            encryptType,
                            null
                        );
                        return web3jService
                            .sendRawTransaction(signedTx)
                            .then((result) => {
                                if (result.status === "0x0") {
                                    let buffer = Buffer.from(
                                        result.output.substring(2),
                                        "hex"
                                    );
                                    let decode_result = decode(
                                        buffer,
                                        outputABI
                                    );
                                    return {
                                        status: result.status,
                                        [contractName]: decode_result.data,
                                        transactionHash: result.transactionHash,
                                    };
                                }

                                if (result.status === "0x16") {
                                    let output = result.output;
                                    let buffer = Buffer.from(
                                        output.substring(2),
                                        "hex"
                                    );
                                    return {
                                        status: result.status,
                                        message: ScaleCodec.decodeString(buffer)
                                            .data,
                                        transactionHash: result.transactionHash,
                                    };
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

module.exports.interfaces = interfaces;
