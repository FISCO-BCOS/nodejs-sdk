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

const constant = require('./constant');
const { check, string, number } = require('./../../common/typeCheck');

const ConditionOp = {
    EQ: 'eq',
    NE: 'ne',
    GT: 'gt',
    GE: 'ge',
    LT: 'lt',
    LE: 'le',
    LIMIT: 'limit'
};

class Condition {
    constructor() {
        this.conditions = {};
    }

    eq(key, value) {
        check(arguments, string, string);

        this.conditions[key] = {
            [ConditionOp.EQ]: value
        };
    }

    ne(key, value) {
        check(arguments, string, string);

        this.conditions[key] = {
            [ConditionOp.NE]: value
        };
    }

    gt(key, value) {
        check(arguments, string, string);

        this.conditions[key] = {
            [ConditionOp.GT]: value
        };
    }

    ge(key, value) {
        check(arguments, string, string);

        this.conditions[key] = {
            [ConditionOp.GE]: value
        };
    }

    lt(key, value) {
        check(arguments, string, string);

        this.conditions[key] = {
            [ConditionOp.LT]: value
        };
    }

    le(key, value) {
        check(arguments, string, string);

        this.conditions[key] = {
            [ConditionOp.LE]: value
        };
    }

    limit(...args) {
        if (args.length === 1) {
            check(arguments, number);

            let count = args[0];
            this.limit(0, count);
        } else {
            check(arguments, number, number);

            let offset = args[0];
            let count = args[1];

            if (offset < 0) {
                offset = 0;
            }

            if (count < 0) {
                count = 0;
            }

            this.conditions['limit'] = {
                [ConditionOp.LIMIT]: offset + ',' + count
            };
        }
    }
}

module.exports.Condition = Condition;
