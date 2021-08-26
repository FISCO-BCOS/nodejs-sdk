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

const isArray = require('isarray');
const path = require('path');
const fs = require('fs');
const pemFile = require('pem-file');
const forge = require('node-forge');
const web3Utils = require('../web3lib/utils');
const ConfigurationError = require('../exceptions').ConfigurationError;
const ENCRYPT_TYPE = require('./constant').ENCRYPT_TYPE;

const EC_PRIVATE_KEY_PREFIX = '30740201010420';
const PRIVATE_KEY_PREFIX_SM = '308187020100301306072a8648ce3d020106082a811ccf5501822d046d306b0201010420';
const PRIVATE_KEY_PREFIX_LEN = 66;

function decodePem(pem, encryptType) {
    let privateKey = null;
    if (encryptType === ENCRYPT_TYPE.ECDSA) {
        if (pem.startsWith(EC_PRIVATE_KEY_PREFIX)) {
            // -----BEGIN EC PRIVATE KEY-----
            privateKey = pem.substring(EC_PRIVATE_KEY_PREFIX.length, EC_PRIVATE_KEY_PREFIX.length + 64);
        } else {
            privateKey = pem.substring(PRIVATE_KEY_PREFIX_LEN, PRIVATE_KEY_PREFIX_LEN + 64);
        }
        return privateKey;
    } else if (encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
        if (pem.startsWith(PRIVATE_KEY_PREFIX_SM)) {
            // -----BEGIN PRIVATE KEY-----
            privateKey = pem.substring(PRIVATE_KEY_PREFIX_SM.length, PRIVATE_KEY_PREFIX_SM.length + 64);
        } else {
            throw new ConfigurationError('expected `EC PRIVATE KEY` or `PRIVATE KEY`');
        }
    }
    return privateKey;
}

class Configuration {
    constructor(configFilePath) {
        if (!configFilePath) {
            throw new ConfigurationError('invalid configuration file path');
        }

        this.configDir = path.dirname(configFilePath);
        let configContent = fs.readFileSync(configFilePath);
        let config = null;
        try {
            config = JSON.parse(configContent);
        } catch (_) {
            throw new ConfigurationError('read configuration file failed, expected a well JSON-formatted file');
        }

        this._parseAuthentication(config);
        this._parseEncryptType(config);
        this._parseNodes(config);
        this._parseGroupID(config);
        this._parseChainID(config);
        this._parseTimeout(config);
        this._parseSolc(config);
        this._parseAccounts(config);
    }

    _parseAuthentication(config) {
        if (!config.authentication || typeof config.authentication !== 'object') {
            throw new ConfigurationError('invalid `authentication` property');
        } else {
            let auth = config.authentication;

            for (let childProperty of ['key', 'cert', 'ca']) {
                if (!auth[childProperty] || typeof auth[childProperty] !== 'string') {
                    throw new ConfigurationError(`invalid ${childProperty} property in \`authentication\``);
                }

                if (!path.isAbsolute(auth[childProperty]) && this.configDir) {
                    auth[childProperty] = path.join(this.configDir, auth[childProperty]);
                }
            }

            this.authentication = auth;
        }
    }

    _parseEncryptType(config) {
        if (!config.encryptType) {
            throw new ConfigurationError('invalid `encryptType` property');
        } else {
            let encryptType = config.encryptType;

            if (typeof encryptType !== 'string') {
                throw new ConfigurationError('invalid type of `encryptType` property, `string` expected');
            } else {
                if (encryptType === 'ECDSA') {
                    this.encryptType = ENCRYPT_TYPE.ECDSA;
                } else if (encryptType === 'SM_CRYPTO') {
                    this.encryptType = ENCRYPT_TYPE.SM_CRYPTO;
                } else {
                    throw new ConfigurationError('invalid value of `encryptType` property, expect `ECDSA` or `SM_CRYPTO`');
                }
            }
        }
    }

    _parseNodes(config) {
        if (!config.nodes || !isArray(config.nodes) || config.nodes.length < 1) {
            throw new ConfigurationError('invalid `nodes` property');
        } else {
            let nodes = config.nodes;
            for (let nodeIndex in nodes) {
                let node = nodes[nodeIndex];
                for (let childProperty of ['ip', 'port']) {
                    if (!node[childProperty] || typeof node[childProperty] !== 'string') {
                        throw new ConfigurationError(`invalid ${childProperty} property in \`nodes\` at position ${parseInt(nodeIndex) + 1}`);
                    }
                }
            }

            this.nodes = nodes;
        }
    }

    _parseGroupID(config) {
        if (!config.groupID || !Number.isInteger(config.groupID)) {
            throw new ConfigurationError('invalid `groupID` property');
        }

        if (config.groupID < 1 || config.groupID > 32767) {
            throw new ConfigurationError('invalid `groupID` property, `groupID` should be within the scope of [1, 32767]');
        }

        this.groupID = config.groupID;
    }

    _parseChainID(config) {
        if (!config.chainID || !Number.isInteger(config.chainID)) {
            throw new ConfigurationError('invalid `chainID` property');
        }

        if (config.chainID < 0 || config.chainID > Number.MAX_SAFE_INTEGER) {
            throw new ConfigurationError(`invalid \`chainID\` property, \`chainID\` should be within the scope of [0, ${Number.MAX_SAFE_INTEGER}]`);
        }

        this.chainID = config.chainID;
    }

    _parseTimeout(config) {
        if (!config.timeout || !Number.isInteger(config.timeout)) {
            throw new ConfigurationError('invalid `timeout` property');
        }

        if (config.timeout < 0 || config.timeout > Number.MAX_SAFE_INTEGER) {
            throw new ConfigurationError(`invalid \`timeout\` property, \`timeout\` should be within the scope of [0, ${Number.MAX_SAFE_INTEGER}]`);
        }

        this.timeout = config.timeout;
    }

    _parseSolc(config) {
        if (config.hasOwnProperty('solc')) {
            if (typeof config.solc !== 'string') {
                throw new ConfigurationError('invalid `solc` property');
            } else {
                this.solc = config.solc;
            }
        } else {
            this.solc = null;
        }
    }

    _parsePrivateKey(privateKey) {
        if (typeof privateKey !== 'object') {
            throw new ConfigurationError('invalid `privateKey` property');
        } else {
            if (!privateKey.type || !(['pem', 'ecrandom', 'p12'].includes(privateKey.type))) {
                throw new ConfigurationError('invalid `type` property in `privateKey`');
            }

            if (!privateKey.value || typeof privateKey.value !== 'string') {
                throw new ConfigurationError('invalid `value` property in `privateKey`');
            }

            switch (privateKey.type) {
                case 'pem':
                    {
                        let pemFilePath = privateKey.value;
                        if (!path.isAbsolute(pemFilePath) && this.configDir) {
                            pemFilePath = path.join(this.configDir, pemFilePath);
                        }

                        let encodedPem = fs.readFileSync(pemFilePath);
                        let decodedPem = pemFile.decode(encodedPem).toString('hex');

                        return decodePem(decodedPem, this.encryptType);
                    }
                case 'ecrandom':
                    {
                        if (privateKey.value.length !== 64) {
                            throw new ConfigurationError('the length of private key should be 128 bits');
                        }
                        return privateKey.value;
                    }
                case 'p12':
                    {
                        if (!privateKey.password || typeof privateKey.password !== 'string') {
                            throw new ConfigurationError('invalid `password` property in `privateKey`');
                        }

                        let p12FilePath = privateKey.value;
                        if (!path.isAbsolute(p12FilePath) && this.configDir) {
                            p12FilePath = path.join(this.configDir, p12FilePath);
                        }

                        let encodedP12 = fs.readFileSync(p12FilePath, 'binary');
                        let p12Asn1 = forge.asn1.fromDer(encodedP12);
                        let p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, privateKey.password);
                        let bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
                        let bag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];

                        let msg = {
                            type: 'PRIVATEKEY',
                            body: forge.asn1.toDer(bag.asn1).getBytes()
                        };
                        let encodedPem = forge.pem.encode(msg);
                        let decodedPem = pemFile.decode(encodedPem).toString('hex');

                        return decodePem(decodedPem, this.encryptType);
                    }
                default:
                    throw new ConfigurationError('should not go here');
            }
        }
    }

    _parseAccounts(config) {
        if (!config.accounts || typeof config.accounts !== 'object') {
            throw new ConfigurationError('invalid `accounts` property');
        } else {
            this.accounts = {};
            for (let id in config.accounts) {
                if (config.accounts.hasOwnProperty(id)) {
                    if (typeof id !== 'string') {
                        throw new ConfigurationError(`invalid id of account: ${id}`);
                    }

                    if (!this.accounts[id]) {
                        this.accounts[id] = {
                            'privateKey': this._parsePrivateKey(config.accounts[id])
                        };
                    } else {
                        throw new ConfigurationError(`duplicate id of private key: ${id}`);
                    }
                }
            }

            for (let id in this.accounts) {
                if (this.accounts.hasOwnProperty(id)) {
                    let account = '0x' + web3Utils.privateKeyToAddress(this.accounts[id].privateKey, this.encryptType).toString('hex');
                    this.accounts[id].account = account;
                }
            }
        }
    }
}

module.exports.Configuration = Configuration;
