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

class ConfigurationError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'ConfigurationError';
    }
}
module.exports.ConfigurationError = ConfigurationError;

class TransactionError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'TransactionError';
    }
}
module.exports.TransactionError = TransactionError;

class PrecompiledError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'PrecompiledError';
    }
}
module.exports.PrecompiledError = PrecompiledError;

class NetworkError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'NetworkError';
    }
}
module.exports.NetworkError = NetworkError;

class CompileError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'CompileError';
    }
}
module.exports.CompileError = CompileError;
