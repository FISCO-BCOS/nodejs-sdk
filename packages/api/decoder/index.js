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

const ethers = require('ethers');
const isArray = require('isarray');
const assert = require('assert');
const deepcopy = require('deepcopy');
const hash = require('../common/web3lib/utils').hash;
const {
    ENCRYPT_TYPE
} = require('../common/configuration');

function formalize(data, type) {
    // for user-defined struct
    if (type.type === 'tuple') {
        let result = {};
        let components = type.components;
        components.forEach((component) => {
            result[component.name] = formalize(data[component.name], component);
        });
        return result;
    }

    let arrayTypeReg = /(.+)\[\d*\]$/;
    let arrayType = arrayTypeReg.exec(type.type);
    if (arrayType) {
        let elementType = deepcopy(type);
        elementType.type = arrayType[1];
        let result = [];

        data.forEach((item) => {
            result.push(formalize(item, elementType));
        });

        return result;
    }

    if (isArray(data)) {
        let result = [];
        assert(isArray(type) && type.length === data.length);

        data.forEach((item, index) => {
            item = formalize(item, type[index]);
            result.push(item);
        });

        return result;
    }

    if (ethers.utils.BigNumber.isBigNumber(data)) {
        return data.toNumber();
    }

    if (ethers.utils.Interface.isIndexed(data)) {
        return data.hash;
    }

    if (type.type === 'address') {
        return data.toLowerCase();
    }

    return data;
}

class MethodDecoder {
    constructor(method) {
        this.method = method;
        this.decoder = ethers.utils.defaultAbiCoder;
    }

    decodeInput(input) {
        let methodID = input.substr(0, 10); // method selector
        input = '0x' + input.substr(10);

        let inputTypes = this.method.inputs;
        let data = this.decoder.decode(inputTypes, input);
        let ret = {
            function: this.method.signature,
            methodID,
            result: formalize(data, inputTypes)
        };
        return ret;
    }

    decodeOutput(output) {
        if (output.startsWith('0x08c379a0')) {
            output = '0x' + output.substr(10);
            let error = this.decoder.decode(['string'], output);
            let ret = {
                function: this.method.signature,
                error
            };
            return ret;
        }

        let outputTypes = this.method.outputs;
        let data = this.decoder.decode(outputTypes, output);
        let ret = {
            function: this.method.signature,
            result: formalize(data, outputTypes)
        };
        return ret;
    }
}

class EventDecoder {
    constructor(event, encryptType) {
        this.event = event;
        this.iface = new ethers.utils.Interface([event]);
        this.encryptType = encryptType;

        // hack for SM Crypto
        if (this.encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
            this.topicMapper = new Map();

            for (var name in this.iface.events) {
                if (name.indexOf('(') === -1) {
                    continue;
                }
                let event = this.iface.events[name];
                this.topicMapper.set('0x' + hash(event.signature, ENCRYPT_TYPE.SM_CRYPTO), event.topic);
            }
        }
    }

    decodeEvent(log) {
        // hack for SM crypto
        if (this.encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
            if (log.topics && log.topics.length >= 1) {
                log.topics[0] = this.topicMapper.get(log.topics[0]);
            }
        }

        let logDesc = this.iface.parseLog(log);
        let inputTypes = this.event.inputs;
        let values = {};

        inputTypes.forEach((input, index) => {
            let name = input.name;
            if (typeof logDesc.values[name] !== 'undefined' && logDesc.values[name] !== null) {
                values[name] = formalize(logDesc.values[name], input);
            }
            values[index] = formalize(logDesc.values[index], input);
        });
        return values;
    }
}

module.exports.createMethodDecoder = function (abi, name) {
    if (name === null) {
        if (isArray(abi)) {
            throw new Error('no ABI desription of the method');
        }

        let iface = new ethers.utils.Interface([abi]);
        return new MethodDecoder(iface.functions[abi.name]);
    } else {
        let iface = new ethers.utils.Interface(abi);
        if (!iface.functions[name]) {
            throw new Error(`no method named as ${name}`);
        }

        return new MethodDecoder(iface.functions[name]);
    }
};

module.exports.createEventDecoder = function (abi, name, encryptType) {
    if (name === null) {
        if (isArray(abi)) {
            throw new Error('no ABI desription of the event');
        }

        return new EventDecoder(abi, encryptType);
    } else {
        let iface = new ethers.utils.Interface(abi);
        if (!iface.events[name]) {
            throw new Error(`no event named as ${name}`);
        }

        return new EventDecoder(iface.events[name], encryptType);
    }
};