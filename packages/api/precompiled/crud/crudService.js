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
const { TableName, handleReceipt } = require('../common');
const { check, string } = require('../../common/typeCheck');
const ServiceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

const Table = require('./table').Table;
const Entry = require('./entry').Entry;
const Condition = require('./condition').Condition;

module.exports.Table = Table;
module.exports.Entry = Entry;
module.exports.Condition = Condition;

class CRUDService extends ServiceBase {
    constructor() {
        super();
        this.web3jService = new Web3jService();
    }

    resetConfig() {
        super.resetConfig();
        this.web3jService.resetConfig();
    }

    _checkTableKeyLength(table) {
        if (table.key.length > constant.TABLE_KEY_MAX_LENGTH) {
            throw new Error(`the value of the table key exceeds the maximum limit (${constant.TABLE_KEY_MAX_LENGTH})`);
        }
    }

    async _send(abi, parameters, readOnly = false, address = constant.CRUD_PRECOMPILE_ADDRESS) {
        let functionName = utils.spliceFunctionSignature(abi);
        let receipt = null;

        if (readOnly) {
            receipt = await this.web3jService.call(address, functionName, parameters);
            receipt = receipt.result;
        } else {
            receipt = await this.web3jService.sendRawTransaction(address, functionName, parameters);
        }
        return handleReceipt(receipt, abi)[0];
    }

    async createTable(table) {
        check(arguments, Table);

        let parameters = [table.tableName, table.key, table.valueFields];
        let output = await this._send(constant.TABLE_FACTORY_PRECOMPILE_ABI.createTable, parameters, false, constant.TABLE_FACTORY_PRECOMPILE_ADDRESS);
        return parseInt(output);
    }

    async insert(table, entry) {
        check(arguments, Table, Entry);
        this._checkTableKeyLength(table);

        let parameters = [table.tableName, table.key, JSON.stringify(entry.fields), table.optional];
        let output = await this._send(constant.CRUD_PRECOMPILE_ABI.insert, parameters);

        return parseInt(output);
    }

    async update(table, entry, condition) {
        check(arguments, Table, Entry, Condition);
        this._checkTableKeyLength(table);

        let parameters = [table.tableName, table.key, JSON.stringify(entry.fields), JSON.stringify(condition.conditions), table.optional];
        let output = await this._send(constant.CRUD_PRECOMPILE_ABI.update, parameters);
        return parseInt(output);
    }

    async select(table, condition) {
        check(arguments, Table, Condition);
        this._checkTableKeyLength(table);

        let parameters = [table.tableName, table.key, JSON.stringify(condition.conditions), table.optional];
        let output = await this._send(constant.CRUD_PRECOMPILE_ABI.select, parameters, true);

        return JSON.parse(output);
    }

    async remove(table, condition) {
        check(arguments, Table, Condition);
        this._checkTableKeyLength(table);

        let parameters = [table.tableName, table.key, JSON.stringify(condition.conditions), table.optional];
        let output = await this._send(constant.CRUD_PRECOMPILE_ABI.remove, parameters);

        return parseInt(output);
    }

    async desc(tableName) {
        check(arguments, string);

        let table = new Table(TableName.SYS_TABLE, TableName.USER_TABLE_PREFIX + tableName, '');
        let condition = new Condition();
        let userTable = await this.select(table, condition);

        if (userTable.length !== 0) {
            let tableInfo = new Table(tableName, userTable[0].key_field, userTable[0].value_field);
            return tableInfo;
        } else {
            throw new PrecompiledError(`the table ${tableName} doesn't exist`);
        }
    }
}

module.exports.CRUDService = CRUDService;
