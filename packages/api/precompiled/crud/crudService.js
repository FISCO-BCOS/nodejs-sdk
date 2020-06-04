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

const PrecompiledError = require('../../common/exceptions').PrecompiledError;
const constant = require('./constant');
const { TableName, handleReceipt, OutputCode } = require('../common');
const { check, Str } = require('../../common/typeCheck');
const ServiceBase = require('../../common/serviceBase').ServiceBase;
const Web3jService = require('../../web3j').Web3jService;
const semver = require('semver');

const Table = require('./table').Table;
const Entry = require('./entry').Entry;
const Condition = require('./condition').Condition;
const ConditionOp = require('./condition').ConditionOp;

module.exports.Table = Table;
module.exports.Entry = Entry;
module.exports.Condition = Condition;
module.exports.ConditionOp = ConditionOp;

class CRUDService extends ServiceBase {
    constructor(config) {
        super(config);
        this.web3jService = new Web3jService(config);
    }

    resetConfig(config) {
        super.resetConfig(config);
        this.web3jService.resetConfig(config);
    }

    _checkTableKeyLength(table) {
        if (table.key.length > constant.TABLE_KEY_MAX_LENGTH) {
            throw new Error(`the value of the table key exceeds the maximum limit (${constant.TABLE_KEY_MAX_LENGTH})`);
        }
    }

    _checkName(name) {
        if (name === '' || name === '_') {
            return false;
        }
        if (!name.match(/^[A-Za-z0-9\$_@]+$/)) {
            return false;
        }

        return true;
    }

    async _send(abi, parameters, readOnly = false, address = constant.CRUD_PRECOMPILE_ADDRESS) {
        let receipt = null;

        if (readOnly) {
            receipt = await this.web3jService.call(address, abi, parameters);
            receipt = receipt.result;
        } else {
            receipt = await this.web3jService.sendRawTransaction(address, abi, parameters);
        }

        return handleReceipt(receipt, abi)[0];
    }

    async createTable(table) {
        check(arguments, Table);

        if (table.tableName.length > 48) {
            throw new PrecompiledError('the table name length is greater than 48.');
        }

        if (table.key.length > constant.SYS_TABLE_KEY_FIELD_NAME_MAX_LENGTH) {
            throw new PrecompiledError(`the table primary key name length is greater than ${constant.SYS_TABLE_KEY_FIELD_NAME_MAX_LENGTH}`);
        }

        if (!this._checkName(table.key)) {
            throw new PrecompiledError(`invalid name of key`);
        }

        if (table.valueFields.length > constant.SYS_TABLE_VALUE_FIELD_MAX_LENGTH) {
            throw new PrecompiledError(`the table total field name length is greater than ${constant.SYS_TABLE_VALUE_FIELD_MAX_LENGTH}`);
        }

        let valueFields = table.valueFields.split(',');
        let collection = [];
        for (let valueField of valueFields) {
            valueField = valueField.trim();
            if (valueField.length > constant.USER_TABLE_FIELD_NAME_MAX_LENGTH) {
                throw new PrecompiledError(`the table field name length is greater than ${constant.USER_TABLE_FIELD_NAME_MAX_LENGTH}`);
            }

            if (!this._checkName(valueField)) {
                throw new PrecompiledError(`invalid name of value field`);
            }

            if (collection.includes(valueField)) {
                throw new PrecompiledError(`multiple fields with the same name \'${valueField}\' is not allowed`);
            }

            collection.push(valueField);
        }

        let parameters = [table.tableName, table.key, collection.join(',')];
        let output = await this._send(constant.TABLE_FACTORY_PRECOMPILE_ABI.createTable, parameters, false, constant.TABLE_FACTORY_PRECOMPILE_ADDRESS);
        let status = parseInt(output);
        if (status === 0) {
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

    async insert(table, entry) {
        check(arguments, Table, Entry);
        this._checkTableKeyLength(table);

        let parameters = [table.tableName, table.key, JSON.stringify(entry.fields), table.optional];
        let output = await this._send(constant.CRUD_PRECOMPILE_ABI.insert, parameters);

        let status = parseInt(output);
        if (status > 0) {
            return {
                code: OutputCode.Success,
                msg: OutputCode.getOutputMessage(OutputCode.Success),
                affected: status
            };
        } else {
            return {
                code: status,
                msg: OutputCode.getOutputMessage(status)
            };
        }
    }

    async update(table, entry, condition) {
        check(arguments, Table, Entry, Condition);
        this._checkTableKeyLength(table);

        let parameters = [table.tableName, table.key, JSON.stringify(entry.fields), JSON.stringify(condition.conditions), table.optional];
        let output = await this._send(constant.CRUD_PRECOMPILE_ABI.update, parameters);

        let status = parseInt(output);
        if (status >= 0) {
            return {
                code: OutputCode.Success,
                msg: OutputCode.getOutputMessage(OutputCode.Success),
                affected: status
            };
        } else {
            return {
                code: status,
                msg: OutputCode.getOutputMessage(status)
            };
        }
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

        let status = parseInt(output);
        if (status >= 0) {
            return {
                code: OutputCode.Success,
                msg: OutputCode.getOutputMessage(OutputCode.Success),
                affected: status
            };
        } else {
            return {
                code: status,
                msg: OutputCode.getOutputMessage(status)
            };
        }
    }

    async desc(tableName) {
        check(arguments, Str);

        let version = await this.web3jService.getClientVersion();
        version = version.result['Supported Version'];
        let userTablePrefix = '_user_';
        if (semver.gte(version, '2.2.0')) {
            userTablePrefix = 'u_';
        }

        let table = new Table(TableName.SYS_TABLE, userTablePrefix + tableName, '');
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
