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
const constant = require('./constant');
const precompiledConstant = require('../constant');
const { check, string } = require('../../base/typeCheck');
const ServiceBase = require('../../base/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;

const Table = require('./table').Table;
const Entry = require('./entry').Entry;
const Condition = require('./condition').Condition;

module.exports.Table = Table;
module.exports.Entry = Entry;
module.exports.Condition = Condition;

class CRUDService extends ServiceBase {
    constructor($config) {
        super($config);
    }

    resetConfig($config) {
        super.resetConfig($config);
        this.web3jService = new Web3jService($config);
    }

    checkTableKeyLength(table) {
        if (table.key.length > constant.TABLE_KEY_MAX_LENGTH) {
            throw new Error(`the value of the table key exceeds the maximum limit (${constant.TABLE_KEY_MAX_LENGTH})`);
        }
    }

    async createTable(table) {
        check(arguments, Table);

        let functionName = utils.spliceFunctionSignature(constant.TABLE_FACTORY_PRECOMPILE_ABI.createTable);
        let parameters = [table.tableName, table.key, table.valueFields];
        let receipt = await this.web3jService.sendRawTransaction(constant.TABLE_FACTORY_PRECOMPILE_ADDRESS, functionName, parameters);

        let status = receipt.output;
        status = status.substring(status.length - 8);
        status = ~~parseInt(status, 16);
        return status;
    }

    async insert(table, entry) {
        check(arguments, Table, Entry);
        this.checkTableKeyLength(table);

        let functionName = utils.spliceFunctionSignature(constant.CRUD_PRECOMPILE_ABI.insert);
        let parameters = [table.tableName, table.key, JSON.stringify(entry.fields), table.optional];
        let receipt = await this.web3jService.sendRawTransaction(constant.CRUD_PRECOMPILE_ADDRESS, functionName, parameters);

        let status = receipt.output;
        return parseInt(status, 16);
    }

    async update(table, entry, condition) {
        check(arguments, Table, Entry, Condition);
        this.checkTableKeyLength(table);

        let functionName = utils.spliceFunctionSignature(constant.CRUD_PRECOMPILE_ABI.update);
        let parameters = [table.tableName, table.key, JSON.stringify(entry.fields), JSON.stringify(condition.conditions), table.optional];
        let receipt = await this.web3jService.sendRawTransaction(constant.CRUD_PRECOMPILE_ADDRESS, functionName, parameters);

        let status = receipt.output;
        return parseInt(status, 16);
    }

    async select(table, condition) {
        check(arguments, Table, Condition);
        this.checkTableKeyLength(table);

        let functionName = utils.spliceFunctionSignature(constant.CRUD_PRECOMPILE_ABI.select);
        let parameters = [table.tableName, table.key, JSON.stringify(condition.conditions), table.optional];
        let receipt = await this.web3jService.call(constant.CRUD_PRECOMPILE_ADDRESS, functionName, parameters);

        let result = receipt.result.output;
        result = utils.decodeMethod(constant.CRUD_PRECOMPILE_ABI.select, result)[0];
        return JSON.parse(result);
    }

    async remove(table, condition) {
        check(arguments, Table, Condition);
        this.checkTableKeyLength(table);

        let functionName = utils.spliceFunctionSignature(constant.CRUD_PRECOMPILE_ABI.remove);
        let parameters = [table.tableName, table.key, JSON.stringify(condition.conditions), table.optional];
        let receipt = await this.web3jService.sendRawTransaction(constant.CRUD_PRECOMPILE_ADDRESS, functionName, parameters);

        let status = receipt.output;
        return parseInt(status, 16);
    }

    async desc(tableName) {
        check(arguments, string);

        let table = new Table(precompiledConstant.SYS_TABLE, precompiledConstant.USER_TABLE_PREFIX + tableName, '');
        let condition = new Condition();
        let userTable = await this.select(table, condition);

        if(userTable.length !== 0) {
            let tableInfo = new Table(tableName, userTable[0].key_field, userTable[0].value_field);
            return tableInfo;
        } else {
            throw new Error(`the table ${tableName} doesn't exist`);
        }
    }
}

module.exports.CRUDService = CRUDService;
