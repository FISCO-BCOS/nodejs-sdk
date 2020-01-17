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

var sm2 = require('./sm_sm2');
var sm3 = require('./sm_sm3');

function signRS(ecprvhex, msg) {
    var keyPair = sm2.SM2KeyPair(null, ecprvhex);
    let x = keyPair.pub.getX().toString(16);
    let y = keyPair.pub.getY().toString(16);
    let pubKeyHex = x + y;
    if (pubKeyHex.length !== 128) {
        pubKeyHex = pubKeyHex.padStart(128, '0');
    }
    var _msg = Array.from(msg);

    var signData = keyPair.sign(_msg);
    var rHex = "000000000000000000000" + signData.r;
    var sHex = "000000000000000000000" + signData.s;
    var rHexLen = rHex.length - 64;
    var sHexLen = sHex.length - 64;
    rHex = rHex.substr(rHexLen, 64);
    sHex = sHex.substr(sHexLen, 64);

    var r = Buffer.from(rHex, 'hex');
    var s = Buffer.from(sHex, 'hex');
    var pub = Buffer.from(pubKeyHex, 'hex');
    return { 'r': r, 's': s, 'pub': pub };
}

function priToPub(ecprvhex) {
    let keyPair = sm2.SM2KeyPair(null, ecprvhex);
    let x = keyPair.pub.getX().toString(16);
    let y = keyPair.pub.getY().toString(16);

    let pubKeyHex = x + y;
    if (pubKeyHex.length !== 128) {
        pubKeyHex = pubKeyHex.padStart(128, '0');
    }
    let pubKey = Buffer.from(pubKeyHex, 'hex');
    return pubKey;
}

function sm3Digest(msg) {
    var _sm3 = new sm3();
    var rawData = Array.from(msg);
    var digest = _sm3.sum(rawData);
    var hashHex = Array.from(digest, function (byte) { return ('0' + (byte & 0xFF).toString(16)).slice(-2); }).join('');
    return hashHex;
}

exports.sm3Digest = sm3Digest;
exports.signRS = signRS;
exports.priToPub = priToPub;
