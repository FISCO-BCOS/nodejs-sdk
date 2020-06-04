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
const { TopicConvertor, Configuration } = require('../packages/api');
const { hash } = require('../packages/api/common/web3lib/utils');

let config = new Configuration(path.join(__dirname, './conf/config.json'));

describe('test for topic convertor', function () {
    it('integer', () => {
        let i = 123456; //i == 0x1E240
        let t = TopicConvertor.fromInteger(i);
        should.equal(t, '0x000000000000000000000000000000000000000000000000000000000001e240');
    });

    it('boolean', () => {
        let b = true;
        let t = TopicConvertor.fromBool(b);
        should.equal(t, '0x0000000000000000000000000000000000000000000000000000000000000001');
        b = false;
        t = TopicConvertor.fromBool(b);
        should.equal(t, '0x0000000000000000000000000000000000000000000000000000000000000000');
    });

    it('address', () => {
        let a = '0xd7ec39ec9e33e6feaa8f10d5f25d896e33b178f8';
        let t = TopicConvertor.fromAddress(a);
        should.equal(t, '0x000000000000000000000000d7ec39ec9e33e6feaa8f10d5f25d896e33b178f8');
    });

    it('string', () => {
        let s = 'Node.js SDK is the best SDK in FISCO BCOS world';
        let t = TopicConvertor.fromString(s, config.encryptType);
        should.equal(t, '0x' + hash(s, config.encryptType));
    });

    it('abi', () => {
        let abi = JSON.parse('{"anonymous":false,"inputs":[{"indexed":false,"name":"s","type":"string"}],"name":"event1","type":"event"}');
        let t = TopicConvertor.fromABI(abi, config.encryptType);
        should.equal(t, '0x' + hash('event1(string)', config.encryptType));
    });

    it('invalid input', () => {
        should.throws(() => {
            TopicConvertor.fromInteger(true);
        });

        should.throws(() => {
            TopicConvertor.fromBool(123);
        });

        should.throws(() => {
            TopicConvertor.fromAddress('0xd7ec39ec9e33e6feaa8f10d5f25d896e33b178');
        });

        should.throws(() => {
            TopicConvertor.fromString(1, null);
        });

        should.throws(() => {
            TopicConvertor.fromABI(1, null);
        });
    });
});