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

module.exports.SYSTEM_CONFIG_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001000';
module.exports.SYSTEM_CONFIG_PRECOMPILE_ABI = {
    'setValueByKey': {"constant":false,"inputs":[{"name":"key","type":"string"},{"name":"value","type":"string"}],"name":"setValueByKey","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"function"}
};
