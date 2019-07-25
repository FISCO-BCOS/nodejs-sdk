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

const utils = require('../../base/utils');
const errorCode = require('../../base/errorCode');
const constant = require('./constant');
const {check, string} = require('../../base/typeCheck');
const ServiceBase = require('../../base/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

class ConsensusService extends ServiceBase {
    constructor($config) {
        super($config);
    }

    resetConfig($config) {
        super.resetConfig($config);
        this.web3jService = new Web3jService($config);
    }

    async isValidNodeID(nodeID) {
        return this.web3jService.getNodeIDList().then(result => {
            let nodeIDs = result.result;
            if (nodeIDs.includes(nodeID)) {
                return true;
            } else {
                return false;
            }
        });
    }

    async addSealer(nodeID) {
        check(arguments, string);

        let isValid = await this.isValidNodeID(nodeID);
        if (!isValid) {
            throw new Error(errorCode.P2pNetwork);
        }

        let sealers = await this.web3jService.getSealerList();
        sealers = sealers.result;

        if (sealers.includes(nodeID)) {
            throw new Error(errorCode.SealerList);
        }

        let functionName = utils.spliceFunctionSignature(constant.CONSENSUS_PRECOMPILE_ABI.addSealer);
        let parameters = [nodeID];
        return this.web3jService.sendRawTransaction(constant.CONSENSUS_PRECOMPILE_ADDRESS, functionName, parameters);
    }

    async addObserver(nodeID) {
        check(arguments, string);

        let isValid = await this.isValidNodeID(nodeID);
        if (!isValid) {
            throw new Error(errorCode.P2pNetwork);
        }

        let observers = await this.web3jService.getObserverList();
        observers = observers.result;

        if (observers.includes(nodeID)) {
            throw new Error(errorCode.ObserverList);
        }

        let functionName = utils.spliceFunctionSignature(constant.CONSENSUS_PRECOMPILE_ABI.addObserver);
        let parameters = [nodeID];
        return this.web3jService.sendRawTransaction(constant.CONSENSUS_PRECOMPILE_ADDRESS, functionName, parameters);
    }

    async removeNode(nodeID) {
        check(arguments, string);

        let peers = await this.web3jService.getGroupPeers();
        peers = peers.result;

        if (!peers.includes(nodeID)) {
            throw new Error(errorCode.GroupPeers);
        }

        let functionName = utils.spliceFunctionSignature(constant.CONSENSUS_PRECOMPILE_ABI.remove);
        let parameters = [nodeID];
        return this.web3jService.sendRawTransaction(constant.CONSENSUS_PRECOMPILE_ADDRESS, functionName, parameters);
    }
}

module.exports.ConsensusService = ConsensusService;
