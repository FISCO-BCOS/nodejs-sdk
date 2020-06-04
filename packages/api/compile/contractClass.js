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

const createMethodDecoder = require('../decoder').createMethodDecoder;
const ethers = require('ethers');
const deepcopy = require('deepcopy');
const { getTxData, encodeParams } = require('../common/web3lib/web3sync');

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
        `let abi = this._functionABIMapper.get("${index}").abi;\n` +
        `let decoder = this._functionABIMapper.get("${index}").decoder;\n` +
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
        `let abi = this._functionABIMapper.get("${index}").abi;\n` +
        `let decoder = this._functionABIMapper.get("${index}").decoer;\n` +
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

function createCodeForGetAddress() {
    let code =
        createCodeForAddressCheck() +
        'return this.address;';
    return code;
}

function createCodeForGetEventABIOf() {
    let code =
        'if(!this._eventABIMapper.has(name)) {\n' +
        '    throw new Error(`no event named as: ${name}`);\n' +
        '}\n' +
        'return this._eventABIMapper.get(name);';

    return code;
}

function createCodeForGetFunctionABIOf() {
    let code =
        'if(!this._functionABIMapper.has(name)) {\n' +
        '    throw new Error(`no function named as: ${name}`);\n' +
        '}\n' +
        'return this._functionABIMapper.get(name).abi;';

    return code;
}

function createContractClass(name, abi, bin, encryptType) {
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
                _functionABIMapper: new Map(),
                _eventABIMapper: new Map()
            };

            let hasExplicitConstructor = false;
            for (let i = 0; i < contractClass.abi.length; ++i) {
                let item = contractClass.abi[i];

                switch (item.type) {
                    case 'function': {
                        if (contract._functionABIMapper.has(contract[item.name])) {
                            throw new Error('function override is not allowed');
                        }

                        let iface = new ethers.utils.Interface([item]);
                        let func = iface.functions[item.name];

                        contract._functionABIMapper.set(item.name, {
                            abi: item,
                            decoder: createMethodDecoder(item, null),
                            meta: func
                        });

                        let parameters = item.inputs.map(input => input.name);
                        parameters = parameters.join(',');

                        if (item.constant) {
                            contract[item.name] = new Function(parameters, createCodeForConstantMethod(item.name));
                        } else {
                            contract[item.name] = new Function(parameters, createCodeForMutableMethod(item.name));
                        }

                        Object.defineProperty(contract[item.name], 'encodeABI', {
                            value: (params = []) => {
                                return getTxData(func, params, encryptType);
                            },
                            writable: false,
                            configurable: false,
                            enumerable: false
                        });

                        break;
                    }
                    case 'constructor': {
                        hasExplicitConstructor = true;
                        let parameters = item.inputs.map(input => input.name);
                        contract.$deploy = new Function('web3jService,' + parameters.join(','), createCodeForConstructor());

                        let contractAbi = new ethers.utils.Interface(contract.abi);
                        let inputs = contractAbi.deployFunction.inputs;

                        Object.defineProperty(contract.$deploy, 'encodeABI', {
                            value: (bin, params = []) => {
                                if (inputs.length !== params.length) {
                                    throw new Error(`wrong number of parameters for constructor, expected ${inputs.length} but got ${params.length}`);
                                }

                                let contractBin = deepcopy(bin);
                                if (params.length !== 0) {
                                    let encodedParams = encodeParams(inputs, params);
                                    contractBin += encodedParams.toString('hex').substr(2);
                                }

                                return contractBin.indexOf('0x') === 0 ? contractBin : ('0x' + contractBin);
                            },
                            writable: false,
                            configurable: false,
                            enumerable: false
                        });
                        break;
                    }
                    case 'event': {
                        if (contract._eventABIMapper.has(item.name)) {
                            throw new Error('event override is not allowed');
                        }

                        contract._eventABIMapper.set(item.name, item);
                        break;
                    }
                }
            }

            if (!hasExplicitConstructor) {
                contract.$deploy = new Function('web3jService', createCodeForConstructor());
            }

            // built-in functions

            // `$getAddress()`, get address of the deployed contract
            contract.$getAddress = new Function('', createCodeForGetAddress());

            // `$getEventABIOf(name)`, get event ABI of the specified name, throw if the abi not exists
            contract.$getEventABIOf = new Function('name', createCodeForGetEventABIOf());

            // `$getFunctionABIOf(name)`, get function ABI of the specified name, throw if the abi not exists
            contract.$getFunctionABIOf = new Function('name', createCodeForGetFunctionABIOf());

            return contract;
        }
    };

    return contractClass;
}

module.exports.createContractClass = createContractClass;