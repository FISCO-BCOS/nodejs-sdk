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
const constant = require('./constant');
const PrecompiledError = require('../../common/exceptions').PrecompiledError;
const { check, string } = require('../../common/typeCheck');
const handleReceipt = require('../common').handleReceipt;
const ServiceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

class CNSService extends ServiceBase {
    constructor() {
        super();
        this.web3jService = new Web3jService();
    }

    resetConfig() {
        super.resetConfig();
        this.web3jService.resetConfig();
    }

    _isValidAddress(address) {
        let addressNoPrefix = utils.cleanHexPrefix(address);
        return addressNoPrefix.length === constant.ADDRESS_LENGTH_IN_HEX;
    }

    _isValidCnsName(input) {
        return input && (input.includes(':') || !this._isValidAddress(input));
    }

    async _send(abi, parameters, readOnly = false) {
        let functionName = utils.spliceFunctionSignature(abi);
        let receipt = null;

        if (readOnly) {
            receipt = await this.web3jService.call(constant.CNS_PRECOMPILE_ADDRESS, functionName, parameters);
            receipt = receipt.result;
        } else {
            receipt = await this.web3jService.sendRawTransaction(constant.CNS_PRECOMPILE_ADDRESS, functionName, parameters);
        }
        return handleReceipt(receipt, abi)[0];
    }

    async registerCns(name, version, address, abi) {
        check(arguments, string, string, string, string);

        let parameters = [name, version, address, abi];
        let output = await this._send(constant.CNS_PRECOMPILE_ABI.insert, parameters);
        return parseInt(output);
    }

    async getAddressByContractNameAndVersion(contractNameAndVersion) {
        check(arguments, string);

        if (!this._isValidCnsName(contractNameAndVersion)) {
            throw new PrecompiledError('invalid contract name and version');
        }

        let contractAddressInfo = null;

        if (contractNameAndVersion.includes(':')) {
            let [contractName, contractVersion] = contractNameAndVersion.split(':', 2);
            let parameters = [contractName, contractVersion];
            contractAddressInfo = await this._send(constant.CNS_PRECOMPILE_ABI.selectByNameAndVersion, parameters, true);
        } else {
            let parameters = [contractNameAndVersion];
            contractAddressInfo = await this._send(constant.CNS_PRECOMPILE_ABI.selectByName, parameters, true);
        }

        if ('[]\n' === contractAddressInfo) {
            throw new PrecompiledError('the contract version does not exist');
        }

        return JSON.parse(contractAddressInfo);
    }

    async queryCnsByName(name) {
        check(arguments, string);

        let parameters = [name];
        let contractAddressInfo = await this._send(constant.CNS_PRECOMPILE_ABI.selectByName, parameters, true);
        return JSON.parse(contractAddressInfo);
    }

    async queryCnsByNameAndVersion(name, version) {
        check(arguments, string, string);

        let parameters = [name, version];
        let contractAddressInfo = await this._send(constant.CNS_PRECOMPILE_ABI.selectByNameAndVersion, parameters, true);
        return JSON.parse(contractAddressInfo);
    }
}

module.exports.CNSService = CNSService;
