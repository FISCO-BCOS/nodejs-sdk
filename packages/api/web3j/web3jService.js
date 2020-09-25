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

const ethers = require('ethers');
const deepcopy = require('deepcopy');

const {
    selectNode
} = require('../common/utils');
const {
    getBlockHeight
} = require('../common/blockHeightCache');
const {
    ServiceBase
} = require('../common/serviceBase');
const {
    channelPromise,
    MESSAGE_TYPE
} = require('../common/network');
const {
    Str,
    Bool,
    StrNeg,
    Addr,
    Obj,
    ArrayList,
    Neg,
    check
} = require('../common/typeCheck');
const {
    getSignTx,
    getSignDeployTx,
    encodeParams,
    getTxData
} = require('../common/web3lib/web3sync');



const QUERY = MESSAGE_TYPE.QUERY;
const TRANSACTION = MESSAGE_TYPE.CHANNEL_RPC_REQUEST;

class Web3jService extends ServiceBase {
    constructor(config) {
        super(config);
    }

    resetConfig(config) {
        super.resetConfig(config);
    }

    _constructRequest(method, params, type = QUERY) {
        let node = selectNode(this.config.nodes);

        let requestData = {
            'jsonrpc': '2.0',
            method,
            params,
            'id': 1
        };

        return channelPromise(requestData, type, node, this.config.authentication, this.config.timeout);
    }

    async getBlockNumber() {
        let promise = this._constructRequest('getBlockNumber', [this.config.groupID]);
        return promise.then((result) => {
            let blockNumber = parseInt(result.result, '16');
            return result;
        });
    }

    async getPbftView() {
        return this._constructRequest('getPbftView', [this.config.groupID]);
    }

    async getObserverList() {
        return this._constructRequest('getObserverList', [this.config.groupID]);
    }

    async getSealerList() {
        return this._constructRequest('getSealerList', [this.config.groupID]);
    }

    async getConsensusStatus() {
        return this._constructRequest('getConsensusStatus', [this.config.groupID]);
    }

    async getSyncStatus() {
        return this._constructRequest('getSyncStatus', [this.config.groupID]);
    }

    async getClientVersion() {
        return this._constructRequest('getClientVersion', [this.config.groupID]);
    }

    async getPeers() {
        return this._constructRequest('getPeers', [this.config.groupID]);
    }

    async getNodeIDList() {
        return this._constructRequest('getNodeIDList', [this.config.groupID]);
    }

    async getGroupPeers() {
        return this._constructRequest('getGroupPeers', [this.config.groupID]);
    }

    async getGroupList() {
        return this._constructRequest('getGroupList', [this.config.groupID]);
    }

    async getBlockByHash(blockHash, includeTransactions) {
        check(arguments, Str, Bool);
        return this._constructRequest('getBlockByHash', [this.config.groupID, blockHash, includeTransactions]);
    }

    async getBlockByNumber(blockNumber, includeTransactions) {
        check(arguments, StrNeg, Bool);
        return this._constructRequest('getBlockByNumber', [this.config.groupID, blockNumber, includeTransactions]);
    }

    async getBlockHashByNumber(blockNumber) {
        check(arguments, StrNeg);
        return this._constructRequest('getBlockHashByNumber', [this.config.groupID, blockNumber]);
    }

    async getTransactionByHash(transactionHash) {
        check(arguments, Str);
        return this._constructRequest('getTransactionByHash', [this.config.groupID, transactionHash]);
    }

    async getTransactionByBlockHashAndIndex(blockHash, transactionIndex) {
        check(arguments, Str, StrNeg);
        return this._constructRequest('getTransactionByBlockHashAndIndex', [this.config.groupID, blockHash, transactionIndex]);
    }

    async getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex) {
        check(arguments, StrNeg, StrNeg);
        return this._constructRequest('getTransactionByBlockNumberAndIndex', [this.config.groupID, blockNumber, transactionIndex]);
    }

    async getPendingTransactions() {
        return this._constructRequest('getPendingTransactions', [this.config.groupID]);
    }

    async getPendingTxSize() {
        return this._constructRequest('getPendingTxSize', [this.config.groupID]);
    }

    async getTotalTransactionCount() {
        return this._constructRequest('getTotalTransactionCount', [this.config.groupID]);
    }

    async getTransactionReceipt(txHash) {
        check(arguments, Str);
        return this._constructRequest('getTransactionReceipt', [this.config.groupID, txHash]);
    }

    async getCode(address) {
        check(arguments, Addr);
        return this._constructRequest('getCode', [this.config.groupID, address]);
    }

    async getSystemConfigByKey(key) {
        check(arguments, Str);
        return this._constructRequest('getSystemConfigByKey', [this.config.groupID, key]);
    }

    _checkParameters(func, params) {
        let name = func.name;
        let inputs = func.inputs;
        if (inputs.length !== params.length) {
            throw new Error(`wrong number of arguments for \`${name}\`, expected ${inputs.length} but got ${params.length}`);
        }
    }

    _getWho(who) {
        if (!who) {
            who = Object.keys(this.config.accounts)[0];
        } else {
            if (!this.config.accounts[who]) {
                throw new Error(`invalid id of account: ${who}`);
            }
        }

        return who;
    }

    _rawTransaction(to, func, params, blockLimit, who) {
        let signTx = getSignTx(this.config, to, func, params, blockLimit, who);
        return signTx;
    }

    async sendRawTransaction(...args) {
        if (args.length === 1) {
            return this._constructRequest('sendRawTransaction', [this.config.groupID, args[0]], TRANSACTION);
        } else {
            check(args.slice(0, 3), Addr, Obj, ArrayList);

            let to = args[0];
            let func = args[1];
            let params = args[2];
            let who = this._getWho(args[3]);

            let iface = new ethers.utils.Interface([func]);
            func = iface.functions[func.name];

            let blockNumber = await getBlockHeight(this.config);
            let signTx = await this._rawTransaction(to, func, params, blockNumber + 500, who);
            return this.sendRawTransaction(signTx);
        }
    }

    async deploy(abi, bin, parameters, who = null) {
        check([abi, bin, parameters], Obj, Str, ArrayList);
        who = this._getWho(who);

        let contractAbi = new ethers.utils.Interface(abi);
        let inputs = contractAbi.deployFunction.inputs;
        if (inputs.length !== parameters.length) {
            throw new Error(`wrong number of parameters for constructor, expected ${inputs.length} but got ${parameters.length}`);
        }

        let contractBin = deepcopy(bin);
        if (parameters.length !== 0) {
            let encodedParams = encodeParams(inputs, parameters);
            contractBin += encodedParams.toString('hex').substr(2);
        }

        let blockNumber = await getBlockHeight(this.config);
        let signTx = getSignDeployTx(this.config, contractBin, blockNumber + 500, who);
        return this.sendRawTransaction(signTx);
    }

    async call(to, func, params, who = null) {
        check([to, func, params], Addr, Obj, ArrayList);
        who = this._getWho(who);

        let iface = new ethers.utils.Interface([func]);
        func = iface.functions[func.name];

        this._checkParameters(func, params);

        let txData = getTxData(func, params, this.config.encryptType);
        return this._constructRequest('call', [this.config.groupID, {
            'from': this.config.accounts[who].account,
            'to': to,
            'value': '0x0',
            'data': txData
        }]);
    }
}

module.exports.Web3jService = Web3jService;
