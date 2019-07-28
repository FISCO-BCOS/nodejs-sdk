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

const { check, string } = require('../../common/typeCheck');

class Table {
    constructor(tableName, key, valueFields, optional = '') {
        check(Array.prototype.slice.call(arguments, 0, 3), string, string, string);
        check(optional, string);

        this.tableName = tableName;
        this.key = key;
        this.valueFields = valueFields;
        this.optional = optional;
    }

    setTableName(name) {
        check(arguments, string);
        this.tableName = name;
    }

    setValueFields(valueFields) {
        check(arguments, string);
        this.valueFields = valueFields;
    }

    setOptional(optional) {
        check(arguments, string);
        this.optional = optional;
    }

    setKey(value) {
        check(arguments, string);
        this.key = value;
    }
}

module.exports.Table = Table;
