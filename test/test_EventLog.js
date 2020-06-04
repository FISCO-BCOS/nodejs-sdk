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
const {
    Configuration,
    Web3jService,
    EventLogService,
    TopicConvertor,
    compile,
    hash,
    EVENT_LOG_FILTER_PUSH_STATUS
} = require('../packages/api');
const { waitFor } = require('./utils');

let config = new Configuration(path.join(__dirname, './conf/config.json'));
let contractPath = path.join(__dirname, './contracts/EventTest.sol');
let contractClass = compile(contractPath, config.encryptType);
let eventTest = contractClass.newInstance();
let web3j = new Web3jService(config);
let event = new EventLogService(config);

describe('test for event log', function () {
    this.beforeAll(() => {
        return eventTest.$deploy(web3j);
    });

    it('event1(string s)', async () => {
        let logs = null;
        let status = null;
        let event1ABI = eventTest.$getEventABIOf('event1');

        let response = await event.registerEventLogFilter({
            addresses: [eventTest.$getAddress()],
            topics: [TopicConvertor.fromABI(event1ABI, config.encryptType)]
        }, (_status, _logs) => {
            status = _status;
            logs = _logs;
        }, event1ABI);
        should.equal(response.result, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);

        await eventTest.method1('1234');
        await waitFor(() => { return status !== null; });

        should.equal(status, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);
        should.equal(logs[0].values.s, '1234');
    });

    it('event2(string s, int256 indexed n)', async () => {
        let logs = null;
        let status = null;
        let event2ABI = eventTest.$getEventABIOf('event2');

        let response = await event.registerEventLogFilter({
            addresses: [eventTest.$getAddress()],
            topics: [TopicConvertor.fromABI(event2ABI, config.encryptType), TopicConvertor.fromInteger(0)]
        }, (_status, _logs) => {
            status = _status;
            logs = _logs;
        }, event2ABI);
        should.equal(response.result, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);

        await eventTest.method2('1234', 0);
        await waitFor(() => { return status !== null; });

        should.equal(status, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);
        should.equal(logs[0].values.s, '1234');
        should.equal(logs[0].values.n, 0);
    });

    it('event3(string indexed s, int256 indexed n)', async () => {
        let logs = null;
        let status = null;
        let narcissism = 'Node.js SDK is the best SDK in FISCO BCOS world';
        let event3ABI = eventTest.$getEventABIOf('event3');

        let response = await event.registerEventLogFilter({
            addresses: [eventTest.$getAddress()],
            topics: [
                TopicConvertor.fromABI(event3ABI, config.encryptType),
                TopicConvertor.fromString(narcissism, config.encryptType),
                TopicConvertor.fromInteger(42)]
        }, (_status, _logs) => {
            status = _status;
            logs = _logs;
        }, event3ABI);
        should.equal(response.result, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);

        await eventTest.method3(narcissism, 42);
        await waitFor(() => { return status !== null; });

        should.equal(status, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);
        should.equal(logs[0].values.s, '0x' + hash(narcissism, config.encryptType));
        should.equal(logs[0].values.n, 42);
    });

    it('event4(address a)', async () => {
        let logs = null;
        let status = null;
        let event4ABI = eventTest.$getEventABIOf('event4');

        let response = await event.registerEventLogFilter({
            addresses: [eventTest.$getAddress()],
            topics: [TopicConvertor.fromABI(event4ABI, config.encryptType)]
        }, (_status, _logs) => {
            status = _status;
            logs = _logs;
        }, event4ABI);
        should.equal(response.result, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);

        await eventTest.method4('0xd7ec39ec9e33e6feaa8f10d5f25d896e33b178f8');
        await waitFor(() => { return status !== null; });

        should.equal(status, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);
        should.equal(logs[0].values.a, '0xd7ec39ec9e33e6feaa8f10d5f25d896e33b178f8');
    });

    it('event5(address indexed a)', async () => {
        let logs = null;
        let status = null;
        let event5ABI = eventTest.$getEventABIOf('event5');

        let response = await event.registerEventLogFilter({
            addresses: [eventTest.$getAddress()],
            topics: [TopicConvertor.fromABI(event5ABI, config.encryptType)]
        }, (_status, _logs) => {
            status = _status;
            logs = _logs;
        }, event5ABI);
        should.equal(response.result, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);

        await eventTest.method5('0xd7ec39ec9e33e6feaa8f10d5f25d896e33b178f8');
        await waitFor(() => { return status !== null; });

        should.equal(status, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);
        should.equal(logs[0].values.a, '0xd7ec39ec9e33e6feaa8f10d5f25d896e33b178f8');
    });

    it('event6(int256 indexed n, bool b, string indexed s)', async () => {
        let logs = null;
        let status = null;
        let event6ABI = eventTest.$getEventABIOf('event6');

        let response = await event.registerEventLogFilter({
            addresses: [eventTest.$getAddress()],
            topics: [
                TopicConvertor.fromABI(event6ABI, config.encryptType),
                TopicConvertor.fromInteger(42),
                TopicConvertor.fromString('1234', config.encryptType)
            ]
        }, (_status, _logs) => {
            status = _status;
            logs = _logs;
        }, event6ABI);
        should.equal(response.result, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);

        await eventTest.method6(42, true, '1234');
        await waitFor(() => { return status !== null; });

        should.equal(status, EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS);
        should.equal(logs[0].values.n, 42);
        should.equal(logs[0].values.b, true);
        should.equal(logs[0].values.s, '0x' + hash('1234', config.encryptType));
    });
});