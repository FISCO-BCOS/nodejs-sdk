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

// TO DO: Support SQL-style grammar

const { produceSubCommandInfo, FLAGS } = require('./base');
const { CRUDService, Table, Condition, Entry } = require('../../api');

function parseCondition(condition) {
    let ops = ['!=', '>=', '<=', '>', '<', '='];

    for (let op of ops) {
        let pos = condition.indexOf(op);
        if (pos >= 0) {
            let key = condition.substring(0, pos);
            let value = condition.substring(pos + 1);
            let ret = new Condition();

            switch (op) {
                case '!=':
                    ret.ne(key, value);
                    return ret;
                case '>=':
                    ret.ge(key, value);
                    return ret;
                case '<=':
                    ret.le(key, value);
                    return ret;
                case '>':
                    ret.gt(key, value);
                    return ret;
                case '<':
                    ret.lt(key, value);
                    return ret;
                case '=':
                    ret.eq(key, value);
                    return ret;
                default:
                    throw new Error('impossible to here');
            }
        }
    }

    throw new Error('illegal condition expression');
}

let interfaces = [];
let crudService = new CRUDService();

interfaces.push(produceSubCommandInfo(
    {
        name: 'create',
        describe: 'Create table',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'Name of the table'
                }
            },
            {
                name: 'key',
                options: {
                    type: 'string',
                    describe: 'Name of primary key',
                }
            },
            {
                name: 'valueFields',
                options: {
                    type: 'string',
                    describe: 'Name of columns, separated by comma'
                }
            },
            {
                name: 'optional',
                options: {
                    type: 'string',
                    describe: 'Optional options',
                    flag: FLAGS.OPTIONAL
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let key = argv.key;
        let valueFields = argv.valueFields;
        let optional = argv.optional;

        let table = new Table(tableName, key, valueFields, optional);
        return crudService.createTable(table).then(status => {
            if (status === 0) {
                return { status: "success", code: status };
            } else {
                return { status: "fail", code: status };
            }
        });
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'select',
        describe: 'Select records from a table',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'Name of the table'
                }
            },
            {
                name: 'key',
                options: {
                    type: 'string',
                    describe: 'The value of primary key'
                }
            },
            {
                name: 'condition',
                options: {
                    type: 'string',
                    describe: 'The condition to filter'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let key = argv.key;
        let condition = parseCondition(argv.condition);

        return crudService.desc(tableName).then(tableInfo => {
            let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);
            return crudService.select(table, condition);
        });
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'insert',
        describe: 'Insert records into a table',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'Name of the table'
                }
            },
            {
                name: 'key',
                options: {
                    type: 'string',
                    describe: 'The value of primary key'
                }
            },
            {
                name: 'entry',
                options: {
                    type: 'string',
                    describe: 'The value of value fields, separated by comma'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let key = argv.key;

        return crudService.desc(tableName).then(tableInfo => {
            let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);

            let fieldNames = tableInfo.valueFields.split(',');
            let fieldValues = argv.entry.split(',');

            if (fieldNames.length !== fieldValues.length) {
                throw new Error(`unmatch number of fields, expected ${fieldNames.length} but got ${fieldValues.length}`);
            }

            let entry = new Entry();
            for (let index in fieldNames) {
                entry.put(fieldNames[index], fieldValues[index]);
            }

            return crudService.insert(table, entry);
        });
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'update',
        describe: 'Update records in a table',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'Name of the table'
                }
            },
            {
                name: 'key',
                options: {
                    type: 'string',
                    describe: 'The value of primary key'
                }
            },
            {
                name: 'entry',
                options: {
                    type: 'string',
                    describe: 'The value of value fields, separated by comma'
                }
            },
            {
                name: 'condition',
                options: {
                    type: 'string',
                    describe: 'The condition to filter'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let key = argv.key;
        let condition = parseCondition(argv.condition);

        return crudService.desc(tableName).then(tableInfo => {
            let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);

            let fieldNames = tableInfo.valueFields.split(',');
            let fieldValues = argv.entry.split(',');

            if (fieldNames.length !== fieldValues.length) {
                throw new Error(`unmatch number of fields, expected ${fieldNames.length} but got ${fieldValues.length}`);
            }

            let entry = new Entry();
            for (let index in fieldNames) {
                entry.put(fieldNames[index], fieldValues[index]);
            }

            return crudService.update(table, entry, condition);
        });
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'remove',
        describe: 'Remove records from a table',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'Name of the table'
                }
            },
            {
                name: 'key',
                options: {
                    type: 'string',
                    describe: 'The value of primary key'
                }
            },
            {
                name: 'condition',
                options: {
                    type: 'string',
                    describe: 'The condition to filter'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let key = argv.key;
        let condition = parseCondition(argv.condition);

        return crudService.desc(tableName).then(tableInfo => {
            let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);
            return crudService.remove(table, condition);
        });
    }
));

interfaces.push(produceSubCommandInfo(
    {
        name: 'desc',
        describe: 'Get information about a table',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'Name of the table'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;

        return crudService.desc(tableName);
    }
));

module.exports.interfaces = interfaces;
