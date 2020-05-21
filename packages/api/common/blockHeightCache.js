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

const { registerBlockNotifyCallback } = require("./network");
const assert = require('assert');

let blockHeightRecords = new Map();

/**
 * Upate block height in cache. This is an internal API and
 * it shouldn't be used directly in you program.
 */
function updateBlockHeight(groupID, blockHeight) {
    if (!blockHeightRecords.has(groupID)) {
        blockHeightRecords.set(groupID, blockHeight);
    } else {
        let currentBlockHeight = blockHeightRecords.get(groupID);
        if (blockHeight > currentBlockHeight) {
            blockHeightRecords.set(groupID, blockHeight);
        }
    }
}

/**
 * Cache block height and update via block notification message. This is an internal API and
 * it shouldn't be used directly in you program.
 * @param {Object} web3j 
 * @returns {Promise} promise to return a block height
 */
async function getBlockHeight(web3j = null) {
    const Configuration = require('../common/configuration').Configuration;
    let groupID = Configuration.getInstance().groupID;

    if (!blockHeightRecords.has(groupID)) {
        if (!web3j) {
            // if can't acquire initial value of block height,
            // set block height to zero and try register block
            // notification callback
            blockHeightRecords.set(groupID, 0);
        } else {
            // `getBlockNumber` wil update cache itself
            await web3j.getBlockNumber();
            assert(blockHeightRecords.has(groupID));
        }

        let nodes = Configuration.getInstance().nodes;
        let authentication = Configuration.getInstance().authentication;
        let callback = (groupID, blockHeight) => { updateBlockHeight(groupID, blockHeight); };

        // send block notify registration to all known nodes to get an accurate block height
        for (let node of nodes) {
            registerBlockNotifyCallback(groupID, callback, node, authentication);
        }

        return blockHeightRecords.get(groupID);
    }
    return blockHeightRecords.get(groupID);
}

module.exports.getBlockHeight = getBlockHeight;
module.exports.updateBlockHeight = updateBlockHeight;