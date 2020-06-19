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

const secp256k1 = require('secp256k1');
const cryptoJSSha3 = require('crypto-js/sha3');
const keccak = require('keccak');
const assert = require('assert');
const rlp = require('rlp');
const ethjsUtil = require('ethjs-util');
const smCrypto = require('./sm_crypto/SM2Sign');
const EC = require('elliptic').ec;

// To prevent circular dependency problem between `configuration` 
// and `web3lib/utils`, please import `ENCRYPT_TYPE` directly via 
// `require('../configuration/constant').ENCRYPT_TYPE`,
// *DO NOT* use `require('../configuration').ENCRYPT_TYPE` or anything similar.
const ENCRYPT_TYPE = require('../configuration/constant').ENCRYPT_TYPE;

/**
 * Convert data to Buffer
 * @param {any} data data to be transformed to buffer
 * @return {Buffer} transformation result
 */
function toBuffer(data) {
    if (!Buffer.isBuffer(data)) {
        if (Array.isArray(data)) {
            data = Buffer.from(data);
        } else if (typeof data === 'string') {
            if (ethjsUtil.isHexPrefixed(data)) {
                data = Buffer.from(ethjsUtil.padToEven(ethjsUtil.stripHexPrefix(data)), 'hex');
            } else {
                data = Buffer.from(data, 'hex');
            }
        } else if (Number.isInteger(data)) {
            data = ethjsUtil.intToBuffer(data);
        } else if (data === null || data === undefined) {
            data = Buffer.allocUnsafe(0);
        } else if (data.toArray) {
            data = Buffer.from(data.toArray());
        } else {
            throw new Error('invalid type');
        }
    }
    return data;
}

/**
 * Calculate hash of data
 * @param {any} data data
 * @param {int} bits length of hash
 * @return {Buffer} hash of data
 */
function sha3(data, bits, encryptType) {
    if (encryptType === ENCRYPT_TYPE.ECDSA) {
        data = toBuffer(data);
        if (!bits) {
            bits = 256;
        }
        let digestData = keccak('keccak' + bits).update(data).digest();
        return digestData;
    } else if (encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
        data = Buffer.from(data);
        let digestData = smCrypto.sm3Digest(data);
        digestData = Buffer.from(digestData, 'hex');
        return digestData;
    } else {
        throw new Error('unsupported type of encryption');
    }
}

/**
 * Calculate public key from private key
 * @param {Buffer} privateKey A private key must be 256 bits wide
 * @return {Buffer} public key
 */
function privateKeyToPublicKey(privateKey, encryptType) {
    if (encryptType === ENCRYPT_TYPE.ECDSA) {
        privateKey = toBuffer(privateKey);
        let publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
        return publicKey;
    } else if (encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
        let publicKey = smCrypto.priToPub(privateKey);
        return publicKey;
    } else {
        throw new Error('unsupported type of encryption');
    }
}

/**
 * Calculate address from public key
 * @param {Buffer} publicKey public key
 * @param {bool} sanitize whether to sanitize publicKey
 * @return {Buffer} address
 */
function publicKeyToAddress(publicKey, encryptType, sanitize = false) {
    if (encryptType === ENCRYPT_TYPE.ECDSA) {
        if (sanitize && (publicKey.length !== 64)) {
            publicKey = secp256k1.publicKeyConvert(publicKey, false).slice(1);
        }
        assert(publicKey.length === 64);
    } else {
        if (encryptType !== ENCRYPT_TYPE.SM_CRYPTO) {
            throw new Error('unsupported type of encryption');
        }
    }
    // Only take the lower 160bits of the hash as address
    return sha3(publicKey, null, encryptType).slice(-20);
}

/**
 * Calculate address from private key
 * @param {Buffer} privateKey private key
 * @return {Buffer} address
 */
function privateKeyToAddress(privateKey, encryptType) {
    return publicKeyToAddress(privateKeyToPublicKey(privateKey, encryptType), encryptType);
}

/**
 * Allocate a zero-filled buffer
 * @param {Number} length the length of buffer
 * @return {Buffer} buffer
 */
function zeros(length) {
    return Buffer.allocUnsafe(length).fill(0);
}

function setLength(msg, length, right) {
    let buf = zeros(length);
    msg = toBuffer(msg);
    if (right) {
        if (msg.length < length) {
            msg.copy(buf);
            return buf;
        }
        return msg.slice(0, length);
    } else {
        if (msg.length < length) {
            msg.copy(buf, length - msg.length);
            return buf;
        }
        return msg.slice(-length);
    }
}

/**
 * Recover public key from (v, r, s)
 * @param {String} msgHash message hash
 * @param {String} v v
 * @param {String} r r
 * @param {String} s s
 * @return {String} public key recovered from (v, r, s)
 */
function ecrecover(msgHash, v, r, s) {
    let signature = Buffer.concat([setLength(r, 32), setLength(s, 32)], 64);
    let recovery = v - 27;
    if (recovery !== 0 && recovery !== 1) {
        throw new Error('Invalid signature v value');
    }
    let senderPubickKey = secp256k1.recover(msgHash, signature, recovery);
    return secp256k1.publicKeyConvert(senderPubickKey, false).slice(1);
}

/**
 * Create sign data
 * @param {String} msgHash message hash
 * @param {String} privateKey private key
 * @return {Object} returns (v, r, s) for secp256k1
 */
function ecsign(msgHash, privateKey, encryptType) {
    let ret = {};
    if (encryptType === ENCRYPT_TYPE.ECDSA) {
        let sig = secp256k1.sign(msgHash, privateKey);
        ret.r = sig.signature.slice(0, 32);
        ret.s = sig.signature.slice(32, 64);
        ret.v = sig.recovery + 27;
    } else if (encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
        privateKey = privateKey.toString('hex');
        let sign = smCrypto.signRS(privateKey, msgHash);
        ret.r = sign.r;
        ret.s = sign.s;
        let publicKey = sign.pub.toString('hex');
        if (publicKey.length !== 128) {
            publicKey = publicKey.padStart(128, '0');
        }
        ret.pub = Buffer.from(publicKey, 'hex');
    } else {
        throw new Error('unsupported type of encryption');
    }
    return ret;
}

/**
 * Calcuate hash of RLP data
 * @param {rlp} data RLP data
 * @return {String} the hash of data
 */
function rlphash(data, encryptType) {
    return sha3(rlp.encode(data), null, encryptType);
}

function hash(str, encryptType) {
    if (encryptType === ENCRYPT_TYPE.SM_CRYPTO) {
        return sha3(str, 256, encryptType).toString('hex');
    } else if (encryptType === ENCRYPT_TYPE.ECDSA) {
        return cryptoJSSha3(str, {
            outputLength: 256
        }).toString();
    } else {
        throw new Error('unsupported type of encryption');
    }
}

/**
 * encode function name
 * @param {String} fcn function name
 * @return {Buffer} function name's code
 */
function encodeFunctionName(fcn, encryptType) {
    let digest = hash(fcn, encryptType);
    let ret = '0x' + digest.slice(0, 8);
    return ret;
}

/**
 * encode event name
 * @param {String} event event ABI
 * @return {Buffer} event name's code
 */
function encodeEventName(event, encryptType) {
    let name = event.name;
    let inputs = event.inputs;
    let signature = name + '(' + inputs.map((input) => { return input.type; }).join(',') + ')';

    let digest = hash(signature, encryptType);
    let ret = '0x' + digest;
    return ret;
}

function createKeyPair() {
    const secp256k1EC = new EC('secp256k1');
    let keyPair = secp256k1EC.genKeyPair();
    let privateKey = Buffer.from(keyPair.getPrivate('hex'), 'hex');
    // remove the prefix '04' of the public key
    let publicKey = Buffer.from(keyPair.getPublic('hex').substr(2), 'hex');

    let keyPairObj = {
        privateKey,
        publicKey
    };
    return keyPairObj;
}

module.exports.privateKeyToPublicKey = privateKeyToPublicKey;
module.exports.publicKeyToAddress = publicKeyToAddress;
module.exports.privateKeyToAddress = privateKeyToAddress;
module.exports.rlphash = rlphash;
module.exports.ecrecover = ecrecover;
module.exports.ecsign = ecsign;
module.exports.sha3 = sha3;
module.exports.toBuffer = toBuffer;

module.exports.hash = hash;
module.exports.encodeFunctionName = encodeFunctionName;
module.exports.encodeEventName = encodeEventName;
module.exports.createKeyPair = createKeyPair;
