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
const { Configuration, CompileService } = require('../packages/api');

const config = new Configuration(path.join(__dirname, './conf/config.json'));
const compileService = new CompileService(config);
const contractPath = path.join(__dirname, './contracts/v4/HelloWorld.sol');
let contractClass = compileService.compile(contractPath);
let eventTest = contractClass.newInstance();

describe('test for getFunctionABIOf', function () {
    it('inexistent', () => {
        should.throws(() => {
            eventTest.$getFunctionABIOf('test');
        });
    });

    it('existent', () => {
        let set = eventTest.$getFunctionABIOf('set');
        should.exist(set);
        should.equal(set.name, 'set');
    });
});