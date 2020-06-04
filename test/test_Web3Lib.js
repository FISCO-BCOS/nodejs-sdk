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
const { createKeyPair, ecsign, ecrecover } = require('../packages/api/common/web3lib/utils');
const { ENCRYPT_TYPE } = require('../packages/api');

describe('test for web3 lib', function () {
    it('createKeyPair', () => {
        let keyPair = createKeyPair();
        let privateKey = keyPair.privateKey;
        let publicKey = keyPair.publicKey;

        let msg = Buffer.from('fc7afa24feb522c2d4fd2a1d3bf41232ac585d1bf9d6656126ee1d993fa09691', 'hex');
        // only available in `ECDSA` mode
        let ret = ecsign(msg, privateKey, ENCRYPT_TYPE.ECDSA);
        let publicKey2 = ecrecover(msg, ret.v, ret.r, ret.s);
        should.equal(publicKey.toString('hex'), publicKey2.toString('hex'));
    });
});