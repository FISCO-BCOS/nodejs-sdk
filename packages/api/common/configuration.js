const web3Utils = require('./web3lib/utils');
const isArray = require('isarray');
const path = require('path');
const fs = require('fs');
const pemFile = require('pem-file');
const forge = require('node-forge');
const deepcopy = require('deepcopy');
const ConfigurationError = require('./exceptions').ConfigurationError;

const EC_PRIVATE_KEY_PREFIX = '30740201010420';
const PRIVATE_KEY_PREFIX = '308184020100301006072a8648ce3d020106052b8104000a046d306b0201010420';
const PRIVATE_KEY_PREFIX_SM = '308187020100301306072a8648ce3d020106082a811ccf5501822d046d306b0201010420';

const ECDSA = 0;
const SM_CRYPTO = 1;

function decodePem(pem, encryptType) {
    let privateKey = null;
    if (encryptType === ECDSA) {
        if (pem.startsWith(EC_PRIVATE_KEY_PREFIX)) {
            // -----BEGIN EC PRIVATE KEY-----
            privateKey = pem.substring(EC_PRIVATE_KEY_PREFIX.length, EC_PRIVATE_KEY_PREFIX.length + 64);
        } else if (pem.startsWith(PRIVATE_KEY_PREFIX)) {
            // -----BEGIN PRIVATE KEY-----
            privateKey = pem.substring(PRIVATE_KEY_PREFIX.length, PRIVATE_KEY_PREFIX.length + 64);
        } else {
            throw new ConfigurationError('expected `EC PRIVATE KEY` or `PRIVATE KEY`');
        }
    } else if (encryptType === SM_CRYPTO) {
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
    static setConfig($config) {
        Configuration.config = $config;
    }

    static getInstance() {
        if (!Configuration.instance) {
            Configuration.instance = new Configuration();
        }
        return Configuration.instance;
    }

    static reset() {
        Configuration.instance = null;
    }

    constructor() {
        let config = deepcopy(Configuration.config);
        let configDir = null;

        if (!config) {
            throw new ConfigurationError('invalid configuration object or file path');
        }

        if (typeof config === 'string') {
            configDir = path.dirname(config);
            let configContent = fs.readFileSync(config);
            try {
                config = JSON.parse(configContent);
            } catch (_) {
                throw new ConfigurationError('read configuration file failed, expected a well JSON-formatted file');
            }
        }

        if (!config.authentication || typeof config.authentication !== 'object') {
            throw new ConfigurationError('invalid `authentication` property');
        } else {
            let auth = config.authentication;

            for (let childProperty of ['key', 'cert', 'ca']) {
                if (!auth[childProperty] || typeof auth[childProperty] !== 'string') {
                    throw new ConfigurationError(`invalid ${childProperty} property in \`authentication\``);
                }

                if (!path.isAbsolute(auth[childProperty]) && configDir) {
                    auth[childProperty] = path.join(configDir, auth[childProperty]);
                }
            }

            this.authentication = auth;
        }

        if (!config.encryptType) {
            throw new ConfigurationError('invalid `encryptType` property');
        } else {
            let encryptType = config.encryptType;

            if (typeof encryptType !== 'string') {
                throw new ConfigurationError('invalid type of `encryptType` property, `string` expected');
            } else {
                if (encryptType === 'ECDSA') {
                    this.encryptType = ECDSA;
                } else if (encryptType === 'SM_CRYPTO') {
                    this.encryptType = SM_CRYPTO;
                } else {
                    throw new ConfigurationError('invalid value of `encryptType` property, expect `ECDSA` or `SM_CRYPTO`');
                }
            }
        }

        if (!config.nodes || !isArray(config.nodes) || config.nodes.length < 1) {
            throw new ConfigurationError('invalid `nodes` property');
        } else {
            let nodes = config.nodes;
            for (let nodeIndex in nodes) {
                let node = nodes[nodeIndex];
                for (let childProperty of ['ip', 'port']) {
                    if (!node[childProperty] || typeof node[childProperty] !== 'string') {
                        throw new ConfigurationError(`invalid ${childProperty} property in \`nodes\` at position ${nodeIndex}`);
                    }
                }
            }

            this.nodes = nodes;
        }

        if (!config.groupID || !Number.isInteger(config.groupID)) {
            throw new ConfigurationError('invalid `groupID` property');
        }

        if (config.groupID < 1 || config.groupID > 32767) {
            throw new ConfigurationError('invalid `groupID` property, `groupID` should be within the scope of [1, 32767]');
        }

        this.groupID = config.groupID;

        if (!config.chainID || !Number.isInteger(config.chainID)) {
            throw new ConfigurationError('invalid `chainID` property');
        }

        if (config.chainID < 0 || config.chainID > Number.MAX_SAFE_INTEGER) {
            throw new ConfigurationError(`invalid \`chainID\` property, \`chainID\` should be within the scope of [0, ${Number.MAX_SAFE_INTEGER}]`);
        }

        this.chainID = config.chainID;

        if (!config.timeout || !Number.isInteger(config.timeout)) {
            throw new ConfigurationError('invalid `timeout` property');
        }

        if (config.timeout < 0 || config.timeout > Number.MAX_SAFE_INTEGER) {
            throw new ConfigurationError(`invalid \`timeout\` property, \`timeout\` should be within the scope of [0, ${Number.MAX_SAFE_INTEGER}]`);
        }

        this.timeout = config.timeout;

        if (config.solc && typeof config.solc !== 'string') {
            throw new ConfigurationError('invalid `solc` property');
        }
        this.solc = config.solc;

        if (!config.privateKey || typeof config.privateKey !== 'object') {
            throw new ConfigurationError('invalid `pem` property');
        } else {
            let privateKey = config.privateKey;
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
                        if (!path.isAbsolute(pemFilePath) && configDir) {
                            pemFilePath = path.join(configDir, pemFilePath);
                        }

                        let encodedPem = fs.readFileSync(pemFilePath);
                        let decodedPem = pemFile.decode(encodedPem).toString('hex');

                        this.privateKey = decodePem(decodedPem, this.encryptType);
                        break;
                    }
                case 'ecrandom':
                    {
                        if (privateKey.value.length !== 64) {
                            throw new ConfigurationError('the length of private key should be 128 bits');
                        }
                        this.privateKey = privateKey.value;
                        break;
                    }
                case 'p12':
                    {
                        if (!privateKey.password || typeof privateKey.password !== 'string') {
                            throw new ConfigurationError('invalid `password` property in `privateKey`');
                        }

                        let p12FilePath = privateKey.value;
                        if (!path.isAbsolute(p12FilePath) && configDir) {
                            p12FilePath = path.join(configDir, p12FilePath);
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

                        this.privateKey = decodePem(decodedPem, this.encryptType);
                        break;
                    }
                default:
                    throw new ConfigurationError('should not go here');
            }
        }
    }
}

module.exports.Configuration = Configuration;
module.exports.ECDSA = ECDSA;
module.exports.SM_CRYPTO = SM_CRYPTO;