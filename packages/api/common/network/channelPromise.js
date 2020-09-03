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

const tls = require('tls');
const fs = require('fs');
const net = require('net');
const uuidv4 = require('uuid/v4');
const events = require('events');
const {
    NetworkError
} = require('../exceptions');
const {
    MESSAGE_TYPE
} = require('./constant');

let emitters = new Map();
let buffers = new Map();
let sockets = new Map();
let lastBytesRead = new Map();

let blockNotifyCallbacks = new Map();
let eventLogFilterCallbacks = new Map();

/**
 * check error code of channel message
 * @param {Number} errorCode error code of channel message
 */
function checkErrorCode(errorCode) {
    switch (errorCode) {
        case 0:
            // successful
            return;
        case 100:
            throw new NetworkError("node unreachable");
        case 101:
            throw new NetworkError("SDK unreachable");
        case 102:
            throw new NetworkError("channel time out");
        default:
            throw new NetworkError(`unknown channel error code: ${errorCode}`);
    }
}

function getEmitter(seq) {
    let emitter = emitters.get(seq);
    if (!emitter) {
        // Stale message received
        return;
    }
    emitter = emitter.emitter;
    if (!emitter) {
        throw new NetworkError(`unknown owner message receieved, seq=${seq}`);
    }
    return emitter;
}

/**
 * Parse channel message returned by node
 * @param {Buffer} response node's response
 */
function parseResponse(response) {
    let seq = response.slice(6, 38).toString();
    let type = response.slice(4, 6).readUInt16BE();
    let errorCode = response.slice(38, 42).readUInt32BE();

    switch (type) {
        case MESSAGE_TYPE.TRANSACTION_NOTIFY: {
            // transaction notification
            checkErrorCode(errorCode);
            let emitter = getEmitter(seq);
            if (emitter) {
                response = JSON.parse(response.slice(42).toString());

                if (response.error || response.status || (response.result && response.result.status)) {
                    emitter.emit('gotresult', response);
                } else {
                    if (!response.result) {
                        throw new NetworkError(`unknown message received, seq=${seq}, data=${response.toString()}`);
                    }
                }
            }
            break;
        }
        case MESSAGE_TYPE.BLOCK_NOTIFY: {
            // block notification, which doesn't care about seq
            checkErrorCode(errorCode);
            let data = response.slice(42);
            // topic length = the actual topic length + 1, strange design
            let topicLength = data.slice(0, 1).readUInt8();
            response = data.slice(topicLength).toString('ascii');
            let [groupID, blockHeight] = response.split(',').map((str) => (parseInt(str)));

            if (blockNotifyCallbacks.has(groupID)) {
                for (let callback of blockNotifyCallbacks.get(groupID)) {
                    callback(groupID, blockHeight);
                }
            }
            break;
        }
        case MESSAGE_TYPE.CHANNEL_RPC_REQUEST: {
            // JSON RPC 2.0 format response
            checkErrorCode(errorCode);
            let emitter = getEmitter(seq);
            if (emitter) {

                response = JSON.parse(response.slice(42).toString());
                let readOnly = Object.getOwnPropertyDescriptor(emitter, 'readOnly').value;

                if (readOnly) {
                    // read-only query
                    if (response.error || typeof response.result !== 'undefined') {
                        emitter.emit('gotresult', response);
                    }
                } else {
                    // transaction
                    if (response.error || response.status || (response.result && response.result.status)) {
                        emitter.emit('gotresult', response);
                    } else {
                        if (!response.result) {
                            throw new NetworkError(`unknown message received, seq=${seq}, data=${response.toString()}`);
                        }
                    }
                }
            }
            break;
        }
        case MESSAGE_TYPE.CLIENT_REGISTER_EVENT_LOG: {
            // result of register event
            checkErrorCode(errorCode);
            let emitter = getEmitter(seq);
            if (emitter) {
                let data = response.slice(42);
                // topic length = the actual topic length + 1, strange design
                let topicLength = data.slice(0, 1).readUInt8();
                response = JSON.parse(data.slice(topicLength).toString());
                emitter.emit('gotresult', response);
            }
            break;
        }
        case MESSAGE_TYPE.EVENT_LOG_PUSH: {
            let data = response.slice(42);
            response = JSON.parse(data);

            let filterID = response.filterID;
            if (eventLogFilterCallbacks.has(filterID)) {
                let callback = eventLogFilterCallbacks.get(filterID);
                callback(response);
            }

            break;
        }
        default:
            throw new NetworkError(`unknown type message received, type=${type}`);
    }
}

/**
 * Create a new TLS socket
 * @param {String} ip IP of channel server
 * @param {Number} port Port of channel server
 * @param {Object} authentication A JSON object contains certificate file path, private key file path and CA file path
 * @return {TLSSocket} A new TLS socket
 */
function createNewSocket(ip, port, authentication) {
    let secureContextOptions = {
        key: fs.readFileSync(authentication.key),
        cert: fs.readFileSync(authentication.cert),
        ca: fs.readFileSync(authentication.ca),
        ecdhCurve: 'secp256k1',
    };

    let secureContext = tls.createSecureContext(secureContextOptions);

    let socket = new net.Socket();
    socket.connect(port, ip);

    let clientOptions = {
        rejectUnauthorized: false,
        secureContext,
        socket
    };

    let tlsSocket = tls.connect(clientOptions);

    let socketID = `${ip}:${port}`;

    lastBytesRead.set(socketID, 0);

    tlsSocket.on('data', function (data) {
        let response = null;
        if (data instanceof Buffer) {
            response = data;
        } else {
            response = Buffer.from(data, 'ascii');
        }

        if (!buffers.has(socketID)) {
            // First time to read data from this socket
            let expectedLength = null;
            if (tlsSocket.bytesRead - lastBytesRead.get(socketID) >= 4) {
                expectedLength = response.readUIntBE(0, 4);
            }

            if (!expectedLength || tlsSocket.bytesRead < lastBytesRead.get(socketID) + expectedLength) {
                buffers.set(socketID, {
                    expectedLength,
                    buffer: response
                });
            } else {
                lastBytesRead.set(socketID, lastBytesRead.get(socketID) + expectedLength);
                parseResponse(response);
                buffers.delete(socketID);
            }
        } else {
            // Multiple reading
            let cache = buffers.get(socketID);
            cache.buffer = Buffer.concat([cache.buffer, response]);
            if (!cache.expectedLength && tlsSocket.bytesRead - lastBytesRead.get(socketID) >= 4) {
                cache.expectedLength = cache.buffer.readUIntBE(0, 4);
            }

            if (cache.expectedLength && tlsSocket.bytesRead - lastBytesRead.get(socketID) >= cache.expectedLength) {
                lastBytesRead.set(socketID, lastBytesRead.get(socketID) + cache.expectedLength);
                parseResponse(buffers.get(socketID).buffer);
                buffers.delete(socketID);
            }
        }
    });

    return tlsSocket;
}

function packWithHeader(data, type) {
    /*
      name    type      length(byte)  description
      length  uint32_t  4             Data packet length, including header and data
      type    uint16_t  2             Data packet type
      seq     string    32            Data packet serial number, 32 bytes
      result  int       4             Process result
    */

    const headerLength = 4 + 2 + 32 + 4;

    let length = Buffer.alloc(4);
    length.writeUInt32BE(headerLength + data.length);

    let dataType = Buffer.alloc(2);
    switch (type) {
        case MESSAGE_TYPE.QUERY:
        case MESSAGE_TYPE.CHANNEL_RPC_REQUEST:
            dataType.writeUInt16BE(MESSAGE_TYPE.CHANNEL_RPC_REQUEST);
            break;
        default:
            dataType.writeUInt16BE(type);
            break;
    }

    let uuid = uuidv4();
    uuid = uuid.replace(/-/g, '');
    let seq = Buffer.from(uuid, 'ascii');

    let result = Buffer.alloc(4);
    result.writeInt32BE(0);

    return {
        uuid,
        'packagedData': Buffer.concat([length, dataType, seq, result, data])
    };
}

/**
 * Prepare the data which will be sent to channel server
 * @param {String} data JSON string of load
 * @param {Number} type type of the request
 * @return {Object} UUID and packaged data
 */
function packData(data, type) {
    let msg = Buffer.from(data, 'ascii');

    return packWithHeader(msg, type);
}

function packAMOPData(topic, data, type) {
    let msg = Buffer.from(data, 'ascii');

    let topicLength = Buffer.alloc(1);
    topicLength.writeInt8(topic.length + 1);

    let topicBuffer = Buffer.from(topic, 'ascii');

    return packWithHeader(Buffer.concat([topicLength, topicBuffer, msg]), type);
}

/**
 * Clear context when a message got response or timeout
 * @param {String} uuid uuid of the request
 */
function clearContext(uuid) {
    if (emitters.get(uuid).timer) {
        clearTimeout(emitters.get(uuid).timer);
    }
    emitters.delete(uuid);
    buffers.delete(uuid);
}

/**
 * Return channel promise for a request
 * @param {Object} data JSON object of request load
 * @param {Number} type type of the request
 * @param {Object} node network address of the peer node
 * @param {Object} authentication information about certificate and private key to construct SSL connection
 * @param {Number} timeout maximum time for waiting response. If `timeout` set to null, that means the request doesn't need any response
 * @return {Promise} a promise which will be resolved when the request is satisfied
 */
function channelPromise(data, type, node, authentication, timeout = null) {
    let ip = node.ip;
    let port = node.port;

    let socketID = `${ip}:${port}`;

    let dataPackage = data;
    if (type) {
        dataPackage = packData(JSON.stringify(data), type);
    }
    let uuid = dataPackage.uuid;

    let packagedData = dataPackage.packagedData;

    return new Promise(async (resolve, reject) => {
        // Singleton Socket instance
        if (!sockets.has(socketID)) {
            let newSocket = createNewSocket(ip, port, authentication);
            newSocket.unref();
            sockets.set(socketID, newSocket);

            let clear = () => {
                buffers.delete(socketID);
                lastBytesRead.delete(socketID);
                sockets.delete(socketID);
            };

            newSocket.on('error', function (error) {
                clear();
                reject(new NetworkError(error));
            });

            newSocket.on('end', () => {
                clear();
                reject(new NetworkError('disconnected from remote node'));
            });
        }
        let tlsSocket = sockets.get(socketID);
        tlsSocket.socketID = uuid;

        if (timeout) {
            let eventEmitter = new events.EventEmitter();

            if (type === MESSAGE_TYPE.QUERY || type === MESSAGE_TYPE.CHANNEL_RPC_REQUEST) {
                Object.defineProperty(eventEmitter, 'readOnly', {
                    value: type === MESSAGE_TYPE.QUERY,
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
            }

            eventEmitter.on('gotresult', (result) => {
                clearContext(uuid);
                if (result.error) {
                    reject(result);
                } else {
                    resolve(result);
                }
                return; // This `return` is not necessary, but it may can avoid future trap
            });

            emitters.set(uuid, {
                emitter: eventEmitter
            });


            eventEmitter.on('timeout', () => {
                clearContext(uuid);
                reject({
                    'error': `timeout when send request:  ${JSON.stringify(data)}`
                });
                return; // This `return` is not necessary, but it may can avoid future trap
            });

            emitters.get(uuid).timer = setTimeout(() => {
                eventEmitter.emit('timeout');
            }, timeout);

            tlsSocket.write(packagedData);
        } else {
            tlsSocket.write(packagedData);
            resolve();
        }
    });
}

function registerBlockNotifyCallback(groupID, callback, node, authentication) {
    if (blockNotifyCallbacks.has(groupID)) {
        blockNotifyCallbacks.get(groupID).push(callback);
    } else {
        blockNotifyCallbacks.set(groupID, [callback]);
    }

    let data = ['_block_notify_' + groupID];
    return channelPromise(data, MESSAGE_TYPE.AMOP_CLIENT_TOPICS, node, authentication);
}

function registerEventLogCallback(params, callback, node, authentication, timeout) {
    let filterID = params.filterID;
    eventLogFilterCallbacks.set(filterID, callback);

    let dataPackage = packAMOPData("", JSON.stringify(params), MESSAGE_TYPE.CLIENT_REGISTER_EVENT_LOG);
    return channelPromise(dataPackage, null, node, authentication, timeout).then((response) => {
        return {
            result: response.result,
            filterID
        };
    });
}

function unregisterEventLogCallback(filterID) {
    eventLogFilterCallbacks.delete(filterID);
}

module.exports.channelPromise = channelPromise;
module.exports.registerBlockNotifyCallback = registerBlockNotifyCallback;
module.exports.registerEventLogCallback = registerEventLogCallback;
module.exports.unregisterEventLogCallback = unregisterEventLogCallback;
