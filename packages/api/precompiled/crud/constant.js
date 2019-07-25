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

module.exports.TABLE_FACTORY_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001001';
module.exports.CRUD_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001002';

module.exports.TABLE_FACTORY_PRECOMPILE_ABI = {
    'createTable': { "constant": false, "inputs": [{ "name": "tableName", "type": "string" }, { "name": "key", "type": "string" }, { "name": "valueField", "type": "string" }], "name": "createTable", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
};
module.exports.CRUD_PRECOMPILE_ABI = {
    'update': { "constant": false, "inputs": [{ "name": "tableName", "type": "string" }, { "name": "key", "type": "string" }, { "name": "entry", "type": "string" }, { "name": "condition", "type": "string" }, { "name": "optional", "type": "string" }], "name": "update", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    'select': { "constant": true, "inputs": [{ "name": "tableName", "type": "string" }, { "name": "key", "type": "string" }, { "name": "condition", "type": "string" }, { "name": "optional", "type": "string" }], "name": "select", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    'insert': { "constant": false, "inputs": [{ "name": "tableName", "type": "string" }, { "name": "key", "type": "string" }, { "name": "entry", "type": "string" }, { "name": "optional", "type": "string" }], "name": "insert", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    'remove': { "constant": false, "inputs": [{ "name": "tableName", "type": "string" }, { "name": "key", "type": "string" }, { "name": "condition", "type": "string" }, { "name": "optional", "type": "string" }], "name": "remove", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
};

module.exports.TABLE_KEY_MAX_LENGTH = 255;
