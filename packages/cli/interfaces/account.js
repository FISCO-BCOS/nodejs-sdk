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

const assert = require('assert')
const produceSubCommandInfo = require('./base').produceSubCommandInfo;
const Configuration = require('../../api/common/configuration').Configuration;

let interfaces = [];

interfaces.push(produceSubCommandInfo(
    {
        name: 'showAccount',
        describe: 'Show account which depends on private key provided in configuration'
    },
    () => {
        let config = Configuration.getInstance();
        assert(config.account, 'you need to set configuration first');
        return Promise.resolve({ account: config.account });
    }));

module.exports.interfaces = interfaces;

