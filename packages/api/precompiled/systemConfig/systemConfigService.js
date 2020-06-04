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

const constant = require('./constant');
const { handleReceipt, OutputCode } = require('../common');
const { check, Str, StrNeg } = require('../../common/typeCheck');
const SeviceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

class SystemConfigService extends SeviceBase {
    constructor(config) {
        super(config);
        this.web3jService = new Web3jService(config);
    }

    resetConfig(config) {
        super.resetConfig(config);
        this.web3jService.resetConfig(config);
    }

    async setValueByKey(key, value) {
        check(arguments, Str, StrNeg);

        let parameters = [key, value];
        let receipt = await this.web3jService.sendRawTransaction(constant.SYSTEM_CONFIG_PRECOMPILE_ADDRESS, constant.SYSTEM_CONFIG_PRECOMPILE_ABI.setValueByKey, parameters);

        let result = handleReceipt(receipt, constant.SYSTEM_CONFIG_PRECOMPILE_ABI.setValueByKey)[0];
        let status = parseInt(result);

        if (status === 1) {
            return {
                code: OutputCode.Success,
                msg: OutputCode.getOutputMessage(OutputCode.Success)
            };
        } else {
            return {
                code: status,
                msg: OutputCode.getOutputMessage(status)
            };
        }
    }
}

module.exports.SystemConfigService = SystemConfigService;
