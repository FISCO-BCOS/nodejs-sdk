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
const {
    getTxData,
    encodeParams
} = require('../common/web3lib/web3sync');

function createCodeForAddressCheck() {
    const code =
        'if (!this.address) {\n' +
        '    throw new Error(`should call \\`$deploy\\` for \\`$load\\` method to initialize ${this.name} contract first`);\n' +
        '}\n';
    return code;
}

function createCodeForConstantMethod(index) {
    const code =
        createCodeForAddressCheck() +
        `let abi = this._functionABIMapper.get("${index}").abi;\n` +
        `let decoder = this._functionABIMapper.get("${index}").decoder;\n` +
        'let user = this._tempUser === null ? this._user: this._tempUser;\n' +
        'return this.web3jService.call(this.address, abi, Array.from(arguments), user).then((result) => {\n' +
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
        '}).finally(() => {\n' +
        '    if (this._tempUser !== null) {\n' +
        '        this._tempUser = null;\n' +
        '    }\n' +
        '});\n';

    return code;
}

function createCodeForMutableMethod(index) {
    const code =
        createCodeForAddressCheck() +
        `let abi = this._functionABIMapper.get("${index}").abi;\n` +
        `let decoder = this._functionABIMapper.get("${index}").decoder;\n` +
        'let user = this._tempUser === null ? this._user: this._tempUser;\n' +
        'return this.web3jService.sendRawTransaction(this.address, abi, Array.from(arguments), user).then((result) => {\n' +
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
        '        return output.result;\n' +
        '    }\n' +
        '    return null;\n' +
        '}).finally(() => {\n' +
        '    if (this._tempUser !== null) {\n' +
        '        this._tempUser = null;\n' +
        '    }\n' +
        '});\n';

    return code;
}

function createCodeForConstructor() {
    const code =
        'if (this.address) {\n' +
        '    throw new Error(`should not call \\`$deploy\\` twice or more times`);\n' +
        '}\n' +
        'let user = this._tempUser === null ? this._user: this._tempUser;\n' +
        'this.web3jService = web3jService;\n' +
        'return this.web3jService.deploy(this.abi, this.bin, Array.from(arguments).slice(1), user).then((result) => {\n' +
        '    this.address = result.contractAddress;\n' +
        '    return this.address;\n' +
        '}).finally(() => {\n' +
        '    if (this._tempUser !== null) {\n' +
        '        this._tempUser = null;\n' +
        '    }\n' +
        '});\n';
    return code;
}

function createCodeForLoad() {
    const code =
        'let user = this._tempUser === null ? this._user: this._tempUser;\n' +
        'this.web3jService = web3jService;\n' +
        'this.address = contractAddress;\n';
    return code;
}

function createCodeForGetAddress() {
    const code =
        createCodeForAddressCheck() +
        'return this.address;';
    return code;
}

function createCodeForGetEventABIOf() {
    const code =
        'if(!this._eventABIMapper.has(name)) {\n' +
        '    throw new Error(`no event named as: ${name}`);\n' +
        '}\n' +
        'return this._eventABIMapper.get(name);';

    return code;
}

function createCodeForGetFunctionABIOf() {
    const code =
        'if(!this._functionABIMapper.has(name)) {\n' +
        '    throw new Error(`no function named as: ${name}`);\n' +
        '}\n' +
        'return this._functionABIMapper.get(name).abi;';

    return code;
}

function createCodeForSetUser() {
    const code = 'this._user = id;';
    return code;
}

function createCodeForBy() {
    const code =
        'this._tempUser = id;\n' +
        'return this;';

    return code;
}

function createContractClass(name, abi, bin, encryptType) {
    if (typeof abi === 'string') {
        abi = JSON.parse(abi);
    }

    const contractClass = {
        name,
        abi,
        bin,
        newInstance: () => {
            const contract = {
                name: contractClass.name,
                abi: contractClass.abi,
                bin: contractClass.bin,
                _functionABIMapper: new Map(),
                _eventABIMapper: new Map(),
                _user: null,
                _tempUser: null
            };

            let hasExplicitConstructor = false;
            for (let i = 0; i < contractClass.abi.length; ++i) {
                const item = contractClass.abi[i];

                switch (item.type) {
                    case 'function': {
                        if (contract._functionABIMapper.has(contract[item.name])) {
                            throw new Error('function override is not allowed');
                        }

                        const iface = new ethers.utils.Interface([item]);
                        const func = iface.functions[item.name];

                        contract._functionABIMapper.set(item.name, {
                            abi: item,
                            decoder: createMethodDecoder(item, null),
                            meta: func
                        });

                        let parameters = item.inputs.map((input) => input.name);

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
                        const parameters = item.inputs.map((input) => input.name);
                        contract.$deploy = new Function(['web3jService'].concat(parameters), createCodeForConstructor());

                        const contractAbi = new ethers.utils.Interface(contract.abi);
                        const inputs = contractAbi.deployFunction.inputs;

                        Object.defineProperty(contract.$deploy, 'encodeABI', {
                            value: (bin, params = []) => {
                                if (inputs.length !== params.length) {
                                    throw new Error(`wrong number of parameters for constructor, expected ${inputs.length} but got ${params.length}`);
                                }

                                let contractBin = deepcopy(bin);
                                if (params.length !== 0) {
                                    const encodedParams = encodeParams(inputs, params);
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
            // `$load()`, load deployed contract
            contract.$load = new Function(['web3jService', 'contractAddress'], createCodeForLoad());

            // `$getAddress()`, get address of the deployed contract
            contract.$getAddress = new Function('', createCodeForGetAddress());

            // `$getEventABIOf(name)`, get event ABI of the specified name, throw if the abi not exists
            contract.$getEventABIOf = new Function('name', createCodeForGetEventABIOf());

            // `$getFunctionABIOf(name)`, get function ABI of the specified name, throw if the abi not exists
            contract.$getFunctionABIOf = new Function('name', createCodeForGetFunctionABIOf());

            // `$setUser(id)`, set permanent user of the contract class instance
            contract.$setUser = new Function('id', createCodeForSetUser());

            // `$by(id)`, set temporary user of deploy or call on contract class instance
            contract.$by = new Function('id', createCodeForBy());

            return contract;
        }
    }

    return contractClass;
}

module.exports.createContractClass = createContractClass;
