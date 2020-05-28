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
const ethers = require('ethers');
const { Configuration, compile } = require('../packages/api');
const { getTxData } = require('../packages/api/common/web3lib/web3sync');

Configuration.setConfig(path.join(__dirname, './conf/config.json'));

let contractPath = path.join(__dirname, './contracts/HelloWorld.sol');
let contractClass = compile(contractPath);
let helloWorld = contractClass.newInstance();

describe('test for encodeABI', function () {
    it('$deploy', () => {
        let encode = helloWorld.$deploy.encodeABI(helloWorld.bin);
        should.exist(encode);
        should.equal(
            encode,
            '0x' + helloWorld.bin
        );
    });

    it('set', () => {
        let encode = helloWorld.set.encodeABI(["123"]);
        should.exist(encode);
        let iface = new ethers.utils.Interface(helloWorld.abi);
        let func = iface.functions.set;
        should.equal(
            encode,
            getTxData(func, ["123"])
        );
    });

    it('get', () => {
        let encode = helloWorld.get.encodeABI();
        should.exist(encode);
        let iface = new ethers.utils.Interface(helloWorld.abi);
        let func = iface.functions.get;
        should.equal(
            encode,
            getTxData(func, [])
        );
    });
});