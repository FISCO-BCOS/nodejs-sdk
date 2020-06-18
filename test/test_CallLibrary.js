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
const { Configuration, Web3jService, CompileService, ENCRYPT_TYPE } = require('../packages/api');

const config = new Configuration(path.join(__dirname, './conf/config.json'));
const compileService = new CompileService(config);
const web3jService = new Web3jService(config);

describe('test for call library', function () {
    it('v4 without linking', async () => {
        const contractPath = path.join(__dirname, './contracts/v4/CallLibrary.sol');
        let contractClass = compileService.compile(contractPath);
        let callLibrary = contractClass.newInstance();

        try {
            let _ = await callLibrary.$deploy(web3jService);
            should.equal(true, false);
        } catch (_) { }
    });

    it('v4 with linking', async () => {
        // not supported in SM_CRYPTO mode yet
        if (config.encryptType === ENCRYPT_TYPE.ECDSA) {
            const contractPath = path.join(__dirname, './contracts/v4/CallLibrary.sol');
            let contractClass = compileService.compile(contractPath, {
                "CallLibrary": {
                    DelegateCallLibary: '0x1234567890123456789012345678901234567890'
                }
            });
            let callLibrary = contractClass.newInstance();
            let address = await callLibrary.$deploy(web3jService);
            should.exist(address);
        }
    });

    it('v5 without linking', async () => {
        const contractPath = path.join(__dirname, './contracts/v5/CallLibrary.sol');
        let contractClass = compileService.compile(contractPath);
        let callLibrary = contractClass.newInstance();

        try {
            let _ = await callLibrary.$deploy(web3jService);
            should.equal(true, false);
        } catch (_) { }
    });

    it('v5 with linking', async () => {
        // not supported in SM_CRYPTO mode yet
        if (config.encryptType === ENCRYPT_TYPE.ECDSA) {
            const contractPath = path.join(__dirname, './contracts/v5/CallLibrary.sol');
            let contractClass = compileService.compile(contractPath, {
                "CallLibrary": {
                    DelegateCallLibary: '0x1234567890123456789012345678901234567890'
                }
            });
            let callLibrary = contractClass.newInstance();
            let address = await callLibrary.$deploy(web3jService);
            should.exist(address);
        }
    });
});


