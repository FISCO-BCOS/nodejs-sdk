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

const utils = require('../common/utils');
const { check, string, boolean } = require('../common/typeCheck');
const channelPromise = require('../common/channelPromise');
const web3Sync = require('../common/web3lib/web3sync');
const isArray = require('isarray');
const path = require('path');
const fs = require('fs');
const ServiceBase = require('../common/serviceBase').ServiceBase;
const READ_ONLY = require('./constant').READ_ONLY;
const Configuration = require('../common/configuration').Configuration;


class Web3jService extends ServiceBase {
    constructor() {
        super();
    }

    resetConfig() {
        super.resetConfig();
    }

    async getBlockNumber() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getBlockNumber',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getPbftView() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getPbftView',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getObserverList() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getObserverList',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getSealerList() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getSealerList',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getConsensusStatus() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getConsensusStatus',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getSyncStatus() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getSyncStatus',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getClientVersion() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getClientVersion',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getPeers() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getPeers',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getNodeIDList() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getNodeIDList',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getGroupPeers() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getGroupPeers',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getGroupList() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getGroupList',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getBlockByHash(blockHash, includeTransactions) {
        check(arguments, string, boolean);

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getBlockByHash',
            'params': [this.config.groupID, blockHash, includeTransactions],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getBlockByNumber(blockNumber, includeTransactions) {
        check(arguments, string, boolean);

        if (parseInt(blockNumber, 10) === NaN && parseInt(blockNumber, 16) === NaN) {
            throw new Error(`invalid block number`);
        }

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getBlockByNumber',
            'params': [this.config.groupID, blockNumber, includeTransactions],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getBlockHashByNumber(blockNumber) {
        check(arguments, string);

        if (parseInt(blockNumber, 10) === NaN && parseInt(blockNumber, 16) === NaN) {
            throw new Error(`invalid block number`);
        }

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getBlockHashByNumber',
            'params': [this.config.groupID, blockNumber],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getTransactionByHash(transactionHash) {
        check(arguments, string);

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getTransactionByHash',
            'params': [this.config.groupID, transactionHash],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getTransactionByBlockHashAndIndex(blockHash, transactionIndex) {
        check(arguments, string, string);

        if (parseInt(transactionIndex, 10) === NaN && parseInt(transactionIndex, 16) === NaN) {
            throw new Error(`invalid transaction index`);
        }

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getTransactionByBlockHashAndIndex',
            'params': [this.config.groupID, blockHash, transactionIndex],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex) {
        check(arguments, string, string);

        if (parseInt(blockNumber, 10) === NaN && parseInt(blockNumber, 16) === NaN) {
            throw new Error(`invalid block number`);
        }

        if (parseInt(transactionIndex, 10) === NaN && parseInt(transactionIndex, 16) === NaN) {
            throw new Error(`invalid transaction index`);
        }

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getTransactionByBlockNumberAndIndex',
            'params': [this.config.groupID, blockNumber, transactionIndex],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getPendingTransactions() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getPendingTransactions',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getPendingTxSize() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getPendingTxSize',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getTotalTransactionCount() {
        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getTotalTransactionCount',
            'params': [this.config.groupID],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getTransactionReceipt(txHash) {
        check(arguments, string);

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getTransactionReceipt',
            'params': [this.config.groupID, txHash],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getCode(address) {
        check(arguments, string);

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getCode',
            'params': [
                this.config.groupID,
                address
            ],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async getSystemConfigByKey(key) {
        check(arguments, string);

        let node = utils.selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'getSystemConfigByKey',
            'params': [
                this.config.groupID,
                key
            ],
            'id': 1
        };

        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }

    async rawTransaction(to, func, params, blockLimit) {
        if (!isArray(params)) {
            params = params ? [params] : [];
        }

        let signTx = web3Sync.getSignTx(this.config.groupID, this.config.account, this.config.privateKey, to, func, params, blockLimit);
        return signTx;
    }

    async sendRawTransaction(...args) {
        let node = utils.selectNode(this.config.nodes);
        if (args.length !== 3) {
            let requestData = {
                'jsonrpc': '2.0',
                'method': 'sendRawTransaction',
                'params': [this.config.groupID, args[0]],
                'id': 1
            };
            return channelPromise(node, this.config.authentication, requestData, this.config.timeout);
        } else {
            let to = args[0];
            let func = args[1];
            let params = args[2];
            let blockNumberResult = await this.getBlockNumber();
            let blockNumber = parseInt(blockNumberResult.result, '16');
            let signTx = await this.rawTransaction(to, func, params, blockNumber + 500);
            return this.sendRawTransaction(signTx);
        }
    }

    async deploy(contractPath, outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        if (!path.isAbsolute(outputDir)) {
            outputDir = path.join(process.cwd(), outputDir);
        }

        if (!path.isAbsolute(contractPath)) {
            contractPath = path.join(process.cwd(), contractPath);
        }

        await utils.compile(contractPath, outputDir, this.config.solc);

        let contractName = path.basename(contractPath, '.sol');
        let contractBin = fs.readFileSync(path.join(outputDir, contractName + '.bin'), 'utf-8');
        let blockNumberResult = await this.getBlockNumber();
        let blockNumber = parseInt(blockNumberResult.result, '16');
        let signTx = web3Sync.getSignDeployTx(this.config.groupID, this.config.account, this.config.privateKey, contractBin, blockNumber + 500);
        return this.sendRawTransaction(signTx);
    }

    async call(to, func, params) {
        if (!isArray(params)) {
            params = params ? [params] : [];
        }

        let txData = web3Sync.getTxData(func, params);

        let requestData = {
            'jsonrpc': '2.0',
            'method': 'call',
            'params': [this.config.groupID, {
                'from': this.config.account,
                'to': to,
                'value': '0x0',
                'data': txData
            }],
            'id': 1
        };

        let node = utils.selectNode(this.config.nodes);
        return channelPromise(node, this.config.authentication, requestData, this.config.timeout, READ_ONLY);
    }
}

module.exports.Web3jService = Web3jService;
