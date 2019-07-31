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

const utils = require('../../common/utils');
const PrecompiledError = require('../../common/exceptions').PrecompiledError;
const constant = require('./constant');
const { OutputCode, handleReceipt } = require('../common');
const { check, string } = require('../../common/typeCheck');
const ServiceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

class ConsensusService extends ServiceBase {
    constructor() {
        super();
        this.web3jService = new Web3jService();
    }

    resetConfig() {
        super.resetConfig();
        this.web3jService.resetConfig();
    }

    async _isValidNodeID(nodeID) {
        return this.web3jService.getNodeIDList().then(result => {
            let nodeIDs = result.result;
            if (nodeIDs.includes(nodeID)) {
                return true;
            } else {
                return false;
            }
        });
    }

    async _send(abi, nodeID) {
        let functionName = utils.spliceFunctionSignature(abi);
        let parameters = [nodeID];
        let receipt = await this.web3jService.sendRawTransaction(constant.CONSENSUS_PRECOMPILE_ADDRESS, functionName, parameters);
        return parseInt(handleReceipt(receipt, abi)[0]);
    }

    async addSealer(nodeID) {
        check(arguments, string);

        let isValid = await this._isValidNodeID(nodeID);
        if (!isValid) {
            throw new PrecompiledError(OutputCode.getOutputMessage(OutputCode.P2PNetwork));
        }

        let sealers = await this.web3jService.getSealerList();
        sealers = sealers.result;

        if (sealers.includes(nodeID)) {
            throw new PrecompiledError(OutputCode.getOutputMessage(OutputCode.SealerList));
        }

        return this._send(constant.CONSENSUS_PRECOMPILE_ABI.addSealer, nodeID);
    }

    async addObserver(nodeID) {
        check(arguments, string);

        let isValid = await this._isValidNodeID(nodeID);
        if (!isValid) {
            throw new PrecompiledError(OutputCode.getOutputMessage(OutputCode.P2PNetwork));
        }

        let observers = await this.web3jService.getObserverList();
        observers = observers.result;

        if (observers.includes(nodeID)) {
            throw new PrecompiledError(OutputCode.getOutputMessage(OutputCode.ObserverList));
        }

        return this._send(constant.CONSENSUS_PRECOMPILE_ABI.addObserver, nodeID);
    }

    async removeNode(nodeID) {
        check(arguments, string);

        let peers = await this.web3jService.getGroupPeers();
        peers = peers.result;

        if (!peers.includes(nodeID)) {
            throw new PrecompiledError(OutputCode.getOutputMessage(OutputCode.GroupPeers));
        }

        return this._send(constant.CONSENSUS_PRECOMPILE_ABI.remove, nodeID);
    }
}

module.exports.ConsensusService = ConsensusService;
