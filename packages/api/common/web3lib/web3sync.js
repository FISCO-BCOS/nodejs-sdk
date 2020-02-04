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
const Configuration = require('../configuration').Configuration;
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
function signTransaction(txData, privKey, callback) {
    let tx = new Transaction(txData);
    let privateKey = Buffer.from(privKey, 'hex');
    tx.sign(privateKey);

    // Build a serialized hex version of the tx
    let serializedTx = '0x' + tx.serialize().toString('hex');
    if (callback !== null) {
        callback(serializedTx);
    } else {
        return serializedTx;
    }
}

/**
 * get transaction data
 * @param {Object} func function info contains signature and input types
 * @param {Array} params params
 * @return {String} transaction data
 */
function getTxData(func, params) {
    let signature = func.signature;
    let inputs = func.inputs;

    let txDataCode = utils.encodeFunctionName(signature);
    let paramsCode = encodeParams(inputs, params);
    txDataCode += ethjsUtil.stripHexPrefix(paramsCode);

    return txDataCode;
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

function formalize(data, type) {
    let arrayTypeReg = /(.+)\[\d*\]$/;
    if (type.type === 'tuple' || arrayTypeReg.exec(type.type)) {
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
 * get signed transaction data
 * @param {Object} config configuration contains groupId, account, privateKey
 * @param {Buffer} to target address
 * @param {Object} func function info contains signature and input types
 * @param {Array} params parameters of the transaction
 * @param {Number} blockLimit block limit
 * @return {String} signed transaction data
 */
function getSignTx(config, to, func, params, blockLimit) {
    let groupID = config.groupID;
    let account = config.account;
    let privateKey = config.privateKey;

    let txData = getTxData(func, params);

    let postdata = {
        data: txData,
        from: account,
        to: to,
        gas: 1000000,
        randomid: genRandomID(),
        blockLimit: blockLimit,
        chainId: Configuration.getInstance().chainID,
        groupId: groupID,
        extraData: '0x0'
    };

    return signTransaction(postdata, privateKey, null);
}

/**
 * get signed deploy tx
 * @param {Object} config configuration contains groupId, account, privateKey
 * @param {Buffer} bin contract bin
 * @param {Number} blockLimit block limit
 * @return {String} signed deploy transaction data
 */
function getSignDeployTx(config, bin, blockLimit) {
    let groupID = config.groupID;
    let account = config.account;
    let privateKey = config.privateKey;
    let txData = bin.indexOf('0x') === 0 ? bin : ('0x' + bin);

    let postdata = {
        data: txData,
        from: account,
        to: null,
        gas: 1000000,
        randomid: genRandomID(),
        blockLimit: blockLimit,
        chainId: Configuration.getInstance().chainID,
        groupId: groupID,
        extraData: '0x0'
    };

    return signTransaction(postdata, privateKey, null);
}

module.exports.getSignDeployTx = getSignDeployTx;
module.exports.signTransaction = signTransaction;
module.exports.getSignTx = getSignTx;
module.exports.getTxData = getTxData;
module.exports.encodeParams = encodeParams;
