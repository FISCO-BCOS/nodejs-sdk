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

module.exports.EVENT_LOG_FILTER_PUSH_STATUS = {
    SUCCESS: 0,
    PUSH_COMPLETED: 1,
    INVALID_PARAMS: -41000,
    INVALID_REQUEST: -41001,
    GROUP_NOT_EXIST: -41002,
    INVALID_RANGE: -41003,
    INVALID_RESPONSE: -41004,
    REQUEST_TIMEOUT: -41005,
    OTHER_ERROR: -41006
};