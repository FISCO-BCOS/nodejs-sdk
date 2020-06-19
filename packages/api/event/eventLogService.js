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

const uuidv4 = require('uuid/v4');
const isArray = require('isarray');
const { selectNode, isValidAddress } = require('../common/utils');
const { Str, ArrayList, check } = require('../common/typeCheck');
const { EVENT_LOG_FILTER_PUSH_STATUS } = require('./constant');
const { registerEventLogCallback, unregisterEventLogCallback } = require('../common/network');
const { ServiceBase } = require('../common/serviceBase');
const { getBlockHeight } = require('../common/blockHeightCache');
const { createEventDecoder } = require('../decoder');
const { encodeEventName } = require('../common/web3lib/utils');

class EventLogService extends ServiceBase {
    constructor(config) {
        super(config);

        this._eventABICache = new Map();
    }

    resetConfig() {
        super.resetConfig();
    }

    async registerEventLogFilter(
        {
            from = "latest",
            to = "latest",
            addresses = [],
            topics = []
        },
        callback = () => { }, abi = null) {
        check([from, to, addresses, topics], Str, Str, ArrayList, ArrayList);
        if (!this._checkParameters(from, to, addresses, topics)) {
            callback(EVENT_LOG_FILTER_PUSH_STATUS.INVALID_PARAMS, null);
        }

        if (abi) {
            if (isArray(abi)) {
                for (let item of abi) {
                    if (item.type === 'event') {
                        let eventSigHash = encodeEventName(item);
                        this._eventABICache.set(eventSigHash, item);
                    }
                }
            } else {
                if (!abi.type || abi.type !== 'event') {
                    throw new Error("invalid event abi");
                }

                let eventSigHash = encodeEventName(abi, this.config.encryptType);
                this._eventABICache.set(eventSigHash, abi);
            }
        }

        let filterID = uuidv4();
        filterID = filterID.replace(/-/g, '');

        let requestData = {
            fromBlock: from,
            toBlock: to,
            addresses,
            topics,
            groupID: this.config.groupID.toString(),
            filterID
        };

        callback = this._encapsulateCallback(callback, filterID, (abi ? true : false));
        let node = selectNode(this.config.nodes);
        return registerEventLogCallback(requestData, callback, node, this.config.authentication, this.config.timeout);
    }

    unregisterEventLogFilter(filterID) {
        unregisterEventLogCallback(filterID);
    }

    async _checkFromTo(from, to) {
        if (from === "" || to === "") {
            return false;
        }

        let blockNumber = await getBlockHeight(this.config);
        if (from === 'latest' && to !== 'latest') {
            let toBlock = parseInt(from, 10);
            if (blockNumber <= 1 || toBlock > blockNumber) {
                return true;
            }
            return false;
        } else if (from !== 'latest' && to === 'latest') {
            let fromBlock = parseInt(from, 10);
            if (fromBlock <= 0) {
                return false;
            }
            return true;
        } else if (from !== 'latest' && to !== 'latest') {
            let fromBlock = parseInt(from, 10);
            let toBlock = parseInt(from, 10);

            if (fromBlock <= 0 || fromBlock > toBlock) {
                return false;
            }
        }

        return true;
    }

    _checkAddresses(addresses) {
        for (let address of addresses) {
            check(address, Str);
            if (!isValidAddress(address)) {
                return false;
            }
        }

        return true;
    }

    _checkTopics(topics) {
        for (let topic of topics) {
            check(topic, Str);
            if (topic === "") {
                return false;
            }
        }

        return true;
    }

    async _checkParameters(from, to, addresses, topics) {
        return (await this._checkFromTo(from, to)) &&
            this._checkAddresses(addresses) &&
            this._checkTopics(topics);
    }

    _encapsulateCallback(callback, filterID, needDecode) {
        return (response) => {
            let status = response.result;

            if (status === EVENT_LOG_FILTER_PUSH_STATUS.SUCCESS) {
                let logs = response.logs;
                let results = [];

                if (logs.length !== 0) {
                    for (let log of logs) {
                        let result = { log };

                        let topic0 = log.topics[0];
                        if (needDecode) {
                            let abi = this._eventABICache.get(topic0);
                            let decoder = createEventDecoder(abi, null, this.config.encryptType);
                            let values = decoder.decodeEvent(log);

                            result.values = values;
                        }
                        results.push(result);
                    }

                    callback(status, results);
                }
            } else {
                // includes EVENT_LOG_FILTER_PUSH_STATUS.PUSH_COMPLETED and other error status
                callback(status, null);
                unregisterEventLogCallback(filterID);
            }
        };
    }
}

module.exports.EventLogService = EventLogService;