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

module.exports.MESSAGE_TYPE = {
    QUERY: 0x11,    // dirty trick, non-stardand type code, use to differentiate read-only request and transaction
    CHANNEL_RPC_REQUEST: 0x12,
    CLIENT_REGISTER_EVENT_LOG: 0x15,
    AMOP_CLIENT_TOPICS: 0x32,
    TRANSACTION_NOTIFY: 0x1000,
    BLOCK_NOTIFY: 0x1001,
    EVENT_LOG_PUSH: 0x1002
};
