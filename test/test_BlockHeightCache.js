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
const should = require('should');
const { Configuration, Web3jService, CompileService } = require('../packages/api');
const { getBlockHeight } = require('../packages/api/common/blockHeightCache');
const { waitFor } = require('./utils');

const config = new Configuration(path.join(__dirname, './conf/config.json'));
const contractPath = path.join(__dirname, './contracts/v4/HelloWorld.sol');
const compileService = new CompileService(config);
const web3jService = new Web3jService(config);
let contractClass = compileService.compile(contractPath);
let helloWorld = contractClass.newInstance();

describe('test for block height cache', () => {
    it('get block height', async () => {
        let currentBlockHeight1 = await getBlockHeight(config);
        should.exist(currentBlockHeight1);

        await helloWorld.$deploy(web3jService);
        await waitFor(async () => {
            let height = await getBlockHeight(config);
            return height !== currentBlockHeight1;
        });

        let currentBlockHeight2 = await getBlockHeight(config);
        should.equal(currentBlockHeight2, currentBlockHeight1 + 1);
    });
});