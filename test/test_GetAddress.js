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

const should = require('should');
const path = require('path');
const { Configuration, Web3jService, compile } = require('../packages/api');

Configuration.setConfig(path.join(__dirname, './conf/config.json'));

let contractPath = path.join(__dirname, './contracts/HelloWorld.sol');
let contractClass = compile(contractPath);
let helloWorld = contractClass.newInstance();
let web3j = new Web3jService();

describe('test for getAddress', function () {
    it('before deploy', () => {
        should.throws(() => {
            helloWorld.$getAddress();
        });
    });

    it('after deploy', async () => {
        let address1 = await helloWorld.$deploy(web3j);
        let address2 = helloWorld.$getAddress();
        should.equal(address1, address2);
    });
});


