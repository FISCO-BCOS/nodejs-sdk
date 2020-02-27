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
module.exports.selectNode = function (nodes) {
    return nodes[Math.floor(Math.random() * nodes.length)];
};

module.exports.cleanHexPrefix = function (input) {
    if (input.startsWith('0x') || input.startsWith('0X')) {
        return input.substring(2);
    }
    return input;
};

module.exports.encodeMethodSignature = function (abi) {
    let functionName = abi.name + '(';
    for (let index in abi.inputs) {
        functionName += abi.inputs[index].type;
        if (index != abi.inputs.length - 1) {
            functionName += ',';
        }
    }
    functionName += ')';
    return functionName;
};
