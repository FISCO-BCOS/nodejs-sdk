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

const { cleanHexPrefix, hash } = require('../common/utils');
const { encodeEventName } = require('../common/web3lib/utils');
const { Bool, Str, Addr, Num, Obj, check } = require('../common/typeCheck');

class TopicConvertor {
    static fromInteger(i) {
        check(arguments, Num);

        return '0x' + i.toString(16).padStart(64, '0');
    }

    static fromBool(boolean) {
        check(arguments, Bool);

        if (boolean) {
            return '0x' + '1'.padStart(64, '0');
        } else {
            return '0x' + '0'.padStart(64, '0');
        }
    }

    static fromAddress(address) {
        check(arguments, Addr);

        return '0x000000000000000000000000' + cleanHexPrefix(address);
    }

    static fromString(str, encryptType) {
        check(arguments, Str, Num);

        return '0x' + hash(str, encryptType);
    }

    static fromABI(eventABI, encryptType) {
        check(arguments, Obj, Num);

        return encodeEventName(eventABI, encryptType);
    }
}

module.exports.TopicConvertor = TopicConvertor;