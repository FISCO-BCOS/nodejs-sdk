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
const handleReceipt = require('../common').handleReceipt;
const { check, string } = require('../../common/typeCheck');
const SeviceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

class SystemConfigService extends SeviceBase {
    constructor() {
        super();
        this.web3jService = new Web3jService();
    }

    resetConfig() {
        super.resetConfig();
        this.web3jService.resetConfig();
    }

    async setValueByKey(key, value) {
        check(arguments, string, string);

        let functionName = utils.spliceFunctionSignature(constant.SYSTEM_CONFIG_PRECOMPILE_ABI.setValueByKey);
        let parameters = [key, value];
        let receipt = await this.web3jService.sendRawTransaction(constant.SYSTEM_CONFIG_PRECOMPILE_ADDRESS, functionName, parameters);

        let output = handleReceipt(receipt, constant.SYSTEM_CONFIG_PRECOMPILE_ABI.setValueByKey)[0];
        return parseInt(output);
    }
}

module.exports.SystemConfigService = SystemConfigService;
