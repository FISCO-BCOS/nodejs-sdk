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

/**
 * Select a node from node list randomly
 * @param {Array} nodes Node list
 * @return {Object} Node
 */
function selectNode(nodes) {
    return nodes[Math.floor(Math.random() * nodes.length)];
}

function cleanHexPrefix(input) {
    if (input.startsWith('0x') || input.startsWith('0X')) {
        return input.substring(2);
    }
    return input;
}

const ADDRESS_LENGTH_IN_HEX = 40;

function isValidAddress(address) {
    let addressNoPrefix = cleanHexPrefix(address);
    return addressNoPrefix.length === ADDRESS_LENGTH_IN_HEX;
}

module.exports.hash = require('./web3lib/utils').hash;
module.exports.selectNode = selectNode;
module.exports.cleanHexPrefix = cleanHexPrefix;
module.exports.isValidAddress = isValidAddress;
