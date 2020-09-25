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

const uuidv4 = require('uuid/v4');
const utils = require('./utils');
const Transaction = require('./transactionObject').Transaction;
const ethjsUtil = require('ethjs-util');
const ethers = require('ethers');
const isArray = require('isarray');
const assert = require('assert');

/**
 * Generate a random number via UUID
 * @return {Number} random number
 */
function genRandomID() {
    let uuid = uuidv4();
    uuid = uuid.replace(/-/g, '');
    if (!uuid.startsWith('0x')) {
        uuid = '0x' + uuid;
    }

    return uuid;
}

/**
 * Sign a transaction with private key and callback
 * @param {String} txData transaction data
 * @param {Buffer} privKey private key
 * @param {callback} callback callback function
 * @return {String} signed transaction data
 */
function signTransaction(txData, privKey, encryptType, callback) {
    let tx = new Transaction(txData, encryptType);
    let privateKey = Buffer.from(privKey, 'hex');
    tx.sign(privateKey, encryptType);

    // Build a serialized hex version of the tx
    let serializedTx = '0x' + tx.serialize().toString('hex');
    if (callback !== null) {
        callback(serializedTx);
    } else {
        return serializedTx;
    }
}

function formalize(data, type) {
    let arrayTypeReg = /(.+)\[\d*\]$/;
    if (type.type === 'tuple' || arrayTypeReg.exec(type.type)) {
        if (data instanceof Object) {
            return data;
        }
        // whatever in struct case or array case, it must be an object
        return JSON.parse(data);
    }

    if (isArray(data)) {
        let result = [];
        assert(isArray(type) && type.length === data.length);

        data.forEach((item, index) => {
            item = formalize(item, type[index]);
            result.push(item);
        });

        return result;
    }

    if (type.type === 'bool') {
        if (data === 'true') {
            return true;
        } else if (data === 'false') {
            return false;
        }

        // just fall through, depends on the converting rule of solidity for boolean
    }

    return data;
}

/**
 * encode params
 * @param {Array} types types
 * @param {Array} params params
 * @return {Buffer} params' code
 */
function encodeParams(types, params) {
    let encoder = ethers.utils.defaultAbiCoder;
    params = formalize(params, types);
    let ret = encoder.encode(types, params);
    return ret;
}

/**
 * get transaction data
 * @param {Object} func function info contains signature and input types
 * @param {Array} params params
 * @return {String} transaction data
 */
function getTxData(func, params, encryptType) {
    let signature = func.signature;
    let inputs = func.inputs;

    let txDataCode = utils.encodeFunctionName(signature, encryptType);
    let paramsCode = encodeParams(inputs, params);
    txDataCode += ethjsUtil.stripHexPrefix(paramsCode);

    return txDataCode;
}

/**
 * get signed transaction data
 * @param {Object} config configuration contains groupId, account, privateKey
 * @param {Buffer} to target address
 * @param {Object} func function info contains signature and input types
 * @param {Array} params parameters of the transaction
 * @param {Number} blockLimit block limit
 * @param {who} the id of account(private key)
 * @return {String} signed transaction data
 */
function getSignTx(config, to, func, params, blockLimit, who) {
    let groupID = config.groupID;
    let account = config.accounts[who].account;
    let privateKey = config.accounts[who].privateKey;
    let chainID = config.chainID;
    let encryptType = config.encryptType;

    let txData = getTxData(func, params, encryptType);

    let postdata = {
        data: txData,
        from: account,
        to: to,
        gas: 1000000,
        randomid: genRandomID(),
        blockLimit: blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData: '0x0'
    };

    return signTransaction(postdata, privateKey, encryptType, null);
}

/**
 * get signed deploy tx
 * @param {Object} config configuration contains groupId, account, privateKey
 * @param {Buffer} bin contract bin
 * @param {Number} blockLimit block limit
 * @param {who} the id of account(private key)
 * @return {String} signed deploy transaction data
 */
function getSignDeployTx(config, bin, blockLimit, who) {
    let groupID = config.groupID;
    let account = config.accounts[who].account;
    let privateKey = config.accounts[who].privateKey;
    let chainID = config.chainID;
    let encryptType = config.encryptType;
    let txData = bin.indexOf('0x') === 0 ? bin : ('0x' + bin);

    let postdata = {
        data: txData,
        from: account,
        to: null,
        gas: 1000000,
        randomid: genRandomID(),
        blockLimit: blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData: '0x0'
    };

    return signTransaction(postdata, privateKey, encryptType, null);
}

module.exports.getSignDeployTx = getSignDeployTx;
module.exports.signTransaction = signTransaction;
module.exports.getSignTx = getSignTx;
module.exports.getTxData = getTxData;
module.exports.encodeParams = encodeParams;