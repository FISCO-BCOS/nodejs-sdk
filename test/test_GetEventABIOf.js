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
const { Configuration, compile } = require('../packages/api');

let config = new Configuration(path.join(__dirname, './conf/config.json'));
let contractPath = path.join(__dirname, './contracts/EventTest.sol');
let contractClass = compile(contractPath, config.encryptType);
let eventTest = contractClass.newInstance();

describe('test for getEventABIOf', function () {
    it('inexistent', () => {
        should.throws(() => {
            eventTest.$getEventABIOf('test');
        });
    });

    it('existent', () => {
        let event1 = eventTest.$getEventABIOf('event1');
        should.exist(event1);
        should.equal(event1.name, 'event1');
        let event2 = eventTest.$getEventABIOf('event2');
        should.exist(event2);
        should.equal(event2.name, 'event2');
        let event3 = eventTest.$getEventABIOf('event3');
        should.exist(event3);
        should.equal(event3.name, 'event3');
        let event4 = eventTest.$getEventABIOf('event4');
        should.exist(event4);
        should.equal(event4.name, 'event4');
    });
});