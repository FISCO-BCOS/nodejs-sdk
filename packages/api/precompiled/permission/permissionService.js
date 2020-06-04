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
const { TableName, handleReceipt, OutputCode } = require('../common');
const { check, Str, Addr } = require('../../common/typeCheck');
const SeviceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;
const CRUDService = require('../crud').CRUDService;

class PermissionService extends SeviceBase {
    constructor(config) {
        super(config);
        this.web3jService = new Web3jService(config);
        this.crudService = new CRUDService(config);
    }

    resetConfig(config) {
        super.resetConfig(config);
        this.web3jService.resetConfig(config);
        this.crudService.resetConfig(config);
    }

    async _grant(tableName, address) {
        let parameters = [tableName, address];

        let receipt = await this.web3jService.sendRawTransaction(constant.PERMISSION_PRECOMPILE_ADDRESS, constant.PERMISSION_PRECOMPILE_ABI.insert, parameters);
        let result = handleReceipt(receipt, constant.PERMISSION_PRECOMPILE_ABI.insert)[0];

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

    async _revoke(tableName, address) {
        let parameters = [tableName, address];

        let receipt = await this.web3jService.sendRawTransaction(constant.PERMISSION_PRECOMPILE_ADDRESS, constant.PERMISSION_PRECOMPILE_ABI.remove, parameters);
        let result = handleReceipt(receipt, constant.PERMISSION_PRECOMPILE_ABI.remove)[0];

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

    async _list(tableName) {
        let parameters = [tableName];
        let receipt = await this.web3jService.call(constant.PERMISSION_PRECOMPILE_ADDRESS, constant.PERMISSION_PRECOMPILE_ABI.queryByName, parameters);

        receipt = receipt.result;
        let result = handleReceipt(receipt, constant.PERMISSION_PRECOMPILE_ABI.queryByName)[0];
        return JSON.parse(result);
    }

    async grantUserTableManager(tableName, address) {
        check(arguments, Str, Addr);

        // Ensure that the table exists
        await this.crudService.desc(tableName);
        return this._grant(tableName, address);
    }

    async revokeUserTableManager(tableName, address) {
        check(arguments, Str, Addr);

        return this._revoke(tableName, address);
    }

    async listUserTableManager(tableName) {
        check(arguments, Str);

        return this._list(tableName);
    }

    async grantDeployAndCreateManager(address) {
        check(arguments, Addr);

        return this._grant(TableName.SYS_TABLE, address);
    }

    async revokeDeployAndCreateManager(address) {
        check(arguments, Addr);

        return this._revoke(TableName.SYS_TABLE, address);
    }

    async listDeployAndCreateManager() {
        return this._list(TableName.SYS_TABLE);
    }

    async grantPermissionManager(address) {
        check(arguments, Addr);

        return this._grant(TableName.SYS_TABLE_ACCESS, address);
    }

    async revokePermissionManager(address) {
        check(arguments, Addr);

        return this._revoke(TableName.SYS_TABLE_ACCESS, address);
    }

    async listPermissionManager() {
        return this._list(TableName.SYS_TABLE_ACCESS);
    }

    async grantNodeManager(address) {
        check(arguments, Addr);

        return this._grant(TableName.SYS_CONSENSUS, address);
    }

    async revokeNodeManager(address) {
        check(arguments, Addr);

        return this._revoke(TableName.SYS_CONSENSUS, address);
    }

    async listNodeManager() {
        return this._list(TableName.SYS_CONSENSUS);
    }

    async grantCNSManager(address) {
        check(arguments, Addr);

        return this._grant(TableName.SYS_CNS, address);
    }

    async revokeCNSManager(address) {
        check(arguments, Addr);

        return this._revoke(TableName.SYS_CNS, address);
    }

    async listCNSManager() {
        return this._list(TableName.SYS_CNS);
    }

    async grantSysConfigManager(address) {
        check(arguments, Addr);

        return this._grant(TableName.SYS_CONFIG, address);
    }

    async revokeSysConfigManager(address) {
        check(arguments, Addr);

        return this._revoke(TableName.SYS_CONFIG, address);
    }

    async listSysConfigManager() {
        return this._list(TableName.SYS_CONFIG);
    }
}

module.exports.PermissionService = PermissionService;
