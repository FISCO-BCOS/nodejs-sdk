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

const path = require('path');
const produceSubCommandInfo = require('./base').produceSubCommandInfo;
const { Configuration } = require('../../api');

let configFile = path.join(process.cwd(), './conf/config.json');
let config = new Configuration(configFile);

let interfaces = [];

interfaces.push(produceSubCommandInfo(
    {
        name: 'showAccount',
        describe: 'Show account of the specified account name',
        args: [
            {
                name: 'id',
                options: {
                    type: 'string',
                    describe: 'The id of a private key'
                }
            }
        ]
    },
    (argv) => {
        let id = argv.id;

        let account = config.accounts[id];
        if (!account) {
            throw new Error(`invalid id of account: ${id}`);
        }
        return Promise.resolve({ account: account.account });
    }));

module.exports.interfaces = interfaces;

