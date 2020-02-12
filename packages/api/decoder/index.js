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
const utils = require('../common/web3lib/utils');

module.exports.createDecoder = function (abi, name) {
    if (!name) {
        assert(!isArray(abi), 'should be ABI desription of a method');

        let iface = new ethers.utils.Interface([abi]);
        return new Decoder(iface.functions[abi.name]);
    } else {
        let iface = new ethers.utils.Interface(abi);
        assert(iface.functions[name], `no method named as ${name}`);

        return new Decoder(iface.functions[name]);
    }
};

class Decoder {
    constructor(method) {
        this.method = method;
        this.decoder = ethers.utils.defaultAbiCoder;
    }

    decodeInput(input) {
        let methodID = input.substr(0, 10);  // method selector
        input = '0x' + input.substr(10);

        let inputTypes = this.method.inputs;
        let data = this.decoder.decode(inputTypes, input);
        return {
            function: this.method.signature,
            methodID: methodID,
            result: formalize(data, inputTypes)
        };
    }

    decodeOutput(output) {
        let methodID = utils.encodeFunctionName(this.method.signature);
        if(output.startsWith('0x08c379a0')) {
            output = '0x' + output.substr(10);
            let error = this.decoder.decode(['string'], output);
            return {
                function: this.method.signature,
                methodID: methodID,
                error: error
            };
        }

        let outputTypes = this.method.outputs;
        let data = this.decoder.decode(outputTypes, output);
        return {
            function: this.method.signature,
            methodID: methodID,
            result: formalize(data, outputTypes)
        };
    }
}

function formalize(data, type) {
    // for user-defined struct
    if (type.type === 'tuple') {
        let result = {};
        let components = type.components;
        components.forEach(component => {
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

        data.forEach(item => {
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

    return data;
}