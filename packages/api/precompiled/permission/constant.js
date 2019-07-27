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

module.exports.PERMISSION_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000001005";
module.exports.PERMISSION_PRECOMPILE_ABI = {
    'insert': { "constant": false, "inputs": [{ "name": "table_name", "type": "string" }, { "name": "addr", "type": "string" }], "name": "insert", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" },
    'queryByName': { "constant": true, "inputs": [{ "name": "table_name", "type": "string" }], "name": "queryByName", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    'remove': { "constant": false, "inputs": [{ "name": "table_name", "type": "string" }, { "name": "addr", "type": "string" }], "name": "remove", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
};
