/*jshint esversion: 8 */
/*jshint node: true */
/*jshint -W054 */

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

const createDecoder = require('../decoder').createDecoder;

'use strict';

function createCodeForAddressCheck() {
    let code =
        'if (!this.address) {\n' +
        '    throw new Error(`should call \\`$deploy\\` method to deploy ${this.name} contract first`);\n' +
        '}\n';
    return code;
}

function createCodeForConstantMethod(index) {
    let code =
        createCodeForAddressCheck() +
        `let abi = this._abis[${index}];\n` +
        `let decoder = this._decoders[${index}];\n` +
        'return this.web3jService.call(this.address, abi, Array.from(arguments)).then((result) => {\n' +
        '    let status = result.result.status;\n' +
        '    let output = result.result.output;\n' +
        '    if (status !== "0x0") {\n' +
        '        let msg = null;\n' +
        '        try {\n' +
        '            msg = decoder.decodeOutput(output);\n' +
        '        } catch(error) {}\n' +
        '        let errorInfo = "unexpected status: " + status;\n' +
        '        if (msg && msg.error) {\n' +
        '            errorInfo += ", message: " + msg.error;\n' +
        '        }\n' +
        '        return new Error(errorInfo);\n' +
        '    }\n' +
        '    if (output !== "0x") {\n' +
        '        output = decoder.decodeOutput(output);\n' +
        '        return output.result;\n' +
        '    }\n' +
        '    return null;\n' +
        '});';

    return code;
}

function createCodeForMutableMethod(index) {
    let code =
        createCodeForAddressCheck() +
        `let abi = this._abis[${index}];\n` +
        `let decoder = this._decoders[${index}];\n` +
        'return this.web3jService.sendRawTransaction(this.address, abi, Array.from(arguments)).then((result) => {\n' +
        '    let status = result.status;\n' +
        '    let output = result.output;\n' +
        '    if (status !== "0x0") {\n' +
        '        let msg = null;\n' +
        '        try {\n' +
        '            msg = decoder.decodeOutput(output);\n' +
        '        } catch(error) {}\n' +
        '        let errorInfo = "unexpected status: " + status;\n' +
        '        if (msg && msg.error) {\n' +
        '            errorInfo += ", message: " + msg.error;\n' +
        '        }\n' +
        '        throw new Error(errorInfo);\n' +
        '    }\n' +
        '    if (output !== "0x") {\n' +
        '        output = decoder.decodeOutput(output);\n' +
        '        return output;\n' +
        '    }\n' +
        '    return null;\n' +
        '});\n';

    return code;
}

function createCodeForConstructor() {
    let code =
        'this.web3jService = web3jService;\n' +
        'return this.web3jService.deploy(this.abi, this.bin, Array.from(arguments).slice(1)).then((result) => {\n' +
        '    this.address = result.contractAddress;\n' +
        '    return this.address;\n' +
        '});';
    return code;
}

function createContractClass(name, abi, bin) {
    if (typeof abi === 'string') {
        abi = JSON.parse(abi);
    }

    let contractClass = {
        name: name,
        abi: abi,
        bin: bin,
        newInstance: () => {
            let contract = {
                name: contractClass.name,
                abi: contractClass.abi,
                bin: contractClass.bin,
                _abis: [],
                _decoders: [],
            };

            for (let i = 0; i < contractClass.abi.length; ++i) {
                let item = contractClass.abi[i];
                if (item.type === 'function') {
                    let parameters = item.inputs.map(input => input.name);
                    parameters = parameters.join(',');
                    contract._abis.push(item);
                    contract._decoders.push(createDecoder(item));

                    if (item.constant) {
                        contract[item.name] = new Function(parameters, createCodeForConstantMethod(i));
                    } else {
                        contract[item.name] = new Function(parameters, createCodeForMutableMethod(i));
                    }
                }

                if (item.type === 'constructor') {
                    let parameters = item.inputs.map(input => input.name);
                    contract.$deploy = new Function('web3jService,' + parameters.join(','), createCodeForConstructor());
                }
            }

            return contract;
        }
    };

    return contractClass;
}

module.exports.createContractClass = createContractClass;