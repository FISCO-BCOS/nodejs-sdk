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

module.exports.CNS_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000001004";
module.exports.CNS_PRECOMPILE_ABI = {
    'selectByName': { "constant": true, "inputs": [{ "name": "name", "type": "string" }], "name": "selectByName", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    'selectByNameAndVersion': { "constant": true, "inputs": [{ "name": "name", "type": "string" }, { "name": "version", "type": "string" }], "name": "selectByNameAndVersion", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" },
    'insert': { "constant": false, "inputs": [{ "name": "name", "type": "string" }, { "name": "version", "type": "string" }, { "name": "addr", "type": "string" }, { "name": "abi", "type": "string" }], "name": "insert", "outputs": [{ "name": "", "type": "int256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
};
module.exports.ADDRESS_LENGTH_IN_HEX = 40;
