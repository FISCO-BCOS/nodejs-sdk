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

let config = new Configuration(path.join(__dirname, './conf/config.json'));
let contractPath = path.join(__dirname, './contracts/HelloWorld.sol');
let contractClass = compile(contractPath, config.encryptType);
let web3j = new Web3jService(config);

// This is a dirty trick to get the latest transaction.
// It depends following truth:
//     - all tests are executed in serial order;
//     - the remote node will process transaction immediately, so there is
//       only one transaction in a block
// DO NOT use this trick in your own applications.
async function _getSender() {
    let blockHeight = await web3j.getBlockNumber();
    blockHeight = blockHeight.result;

    return web3j.getTransactionByBlockNumberAndIndex(blockHeight, '0');
}

describe('test for multi user', function () {
    it('alice', async () => {
        let helloWorld = contractClass.newInstance();
        helloWorld.$setUser('alice');

        await helloWorld.$deploy(web3j);
        let tx = await _getSender();
        let sender = tx.result.from;
        should.exist(sender);
        should.equal(sender, config.accounts.alice.account);

        await helloWorld.set('Hello Cat');
        tx = await _getSender();
        sender = tx.result.from;
        should.exist(sender);
        should.equal(sender, config.accounts.alice.account);
    });

    it('bob', async () => {
        let helloWorld = contractClass.newInstance();
        helloWorld.$setUser('bob');

        await helloWorld.$deploy(web3j);
        let tx = await _getSender();
        let sender = tx.result.from;
        should.exist(sender);
        should.equal(sender, config.accounts.bob.account);

        await helloWorld.set('Hello Cat');
        tx = await _getSender();
        sender = tx.result.from;
        should.exist(sender);
        should.equal(sender, config.accounts.bob.account);
    });

    it('hybrid', async () => {
        let helloWorld = contractClass.newInstance();

        await helloWorld.$by('alice').$deploy(web3j);
        let tx = await _getSender();
        let sender = tx.result.from;
        should.exist(sender);
        should.equal(sender, config.accounts.alice.account);

        await helloWorld.$by('bob').set('Hello Cat');
        tx = await _getSender();
        sender = tx.result.from;
        should.exist(sender);
        should.equal(sender, config.accounts.bob.account);
    });
});


