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

const path = require('path');
const { produceSubCommandInfo } = require('./base');
const { CRUDService, Table, Condition, Entry, ConditionOp, Configuration } = require('../../api');

// SQL Parser
const { Parser } = require('node-sql-parser');

let interfaces = [];
let configFile = path.join(process.cwd(), './conf/config.json');
let config = new Configuration(configFile);
let crudService = new CRUDService(config);

function parseWhere(where, condition) {
    if (where.type === 'binary_expr') {
        if (where.operator === 'AND') {
            parseWhere(where.left, condition);
            parseWhere(where.right, condition);
        } else {
            if (where.left.type !== 'column_ref') {
                throw new Error('left side of condition should be a name of field');
            }

            if (where.right.type !== 'string') {
                throw new Error('right side of condition should be a string');
            }

            let key = where.left.column;
            let value = where.right.value;

            switch (where.operator) {
                case '=':
                    condition.eq(key, value);
                    break;
                case '!=':
                    condition.ne(key, value);
                    break;
                case '>=':
                    condition.ge(key, value);
                    break;
                case '<=':
                    condition.le(key, value);
                    break;
                case '>':
                    condition.gt(key, value);
                    break;
                case '<':
                    condition.lt(key, value);
                    break;
                default:
                    throw new Error('unsupported operator');
            }
        }
    }
}

function parseCreateTable(ast) {
    let tableName = ast.table[0].table;
    let definitions = ast.create_definitions;
    let fields = [];
    let primaryKey;

    for (let definition of definitions) {
        if (definition.column && definition.column.column) {
            let columnName = definition.column.column;
            fields.push(columnName);
        } else {
            if (definition.constraint_type && definition.constraint_type === 'primary key') {
                if (primaryKey) {
                    throw new Error('primary key specified more than once');
                }

                primaryKey = definition.definition[0];
            }
        }
    }

    if (!primaryKey) {
        throw new Error('no primary key specified');
    }

    let index = fields.indexOf(primaryKey);
    if (index > -1) {
        fields.splice(index, 1);
    }

    fields = fields.join(',');
    let table = new Table(tableName, primaryKey, fields);
    return crudService.createTable(table);
}

function parseSelect(ast) {
    let from = ast.from;
    if (from.length !== 1) {
        throw new Error('select from multiple tables is not supported yet');
    }

    let tableName = from[0].table;

    return crudService.desc(tableName).then(tableInfo => {
        let valueFields = tableInfo.valueFields.split(',');
        valueFields.unshift(tableInfo.key);
        let columns = [];
        if (ast.columns !== '*') {
            for (let column of ast.columns) {
                column = column.expr.column;
                if (!valueFields.includes(column)) {
                    throw new Error(`there is no \`${column}\` field in table \`${tableName}\``);
                }
                columns.push(column);
            }
        }

        let where = ast.where;
        let condition = new Condition();
        parseWhere(where, condition);

        if (!condition.conditions[tableInfo.key] || !condition.conditions[tableInfo.key][ConditionOp.EQ]) {
            throw new Error(`value of primary key \`${tableInfo.key}\` should be provided in where clause`);
        }

        let key = condition.conditions[tableInfo.key][ConditionOp.EQ];
        let limit = ast.limit;
        if (limit) {
            let negConvert = function (num, name) {
                if (!Number.isInteger(num)) {
                    throw new Error(`${name} should be a non-negative integer`);
                }
                num = parseInt(num);
                if (num < 0) {
                    throw new Error(`${name} should be a non-negative integer`);
                }
                return num;
            };

            if (limit.value.length === 1) {
                limit = limit.value[0].value;
                limit = negConvert(limit, 'limit');
                condition.limit(limit);
            } else if (limit.value.length === 2) {
                let offset = limit.value[0].value;
                limit = limit.value[1].value;

                offset = negConvert(offset, 'offset');
                limit = negConvert(limit, 'limit');
                condition.limit(offset, limit);
            }
        }

        let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);
        return crudService.select(table, condition).then((rows) => {
            let ret = [];
            let fields;

            if (ast.columns === '*') {
                fields = valueFields;
            } else {
                fields = columns;
            }

            for (let row of rows) {
                let result = {};
                for (let column of fields) {
                    result[column] = row[column];
                }
                ret.push(result);
            }
            return ret;
        });
    });
}

function parseInsert(ast) {
    let tableName = ast.table[0].table;
    let fields = ast.columns;
    let values = [];
    let key;

    for (var index = 0; index < ast.values[0].value.length; ++index) {
        let value = ast.values[0].value[index];
        if (value.type !== 'string') {
            throw new Error(`value at position ${parseInt(index) + 1} should be a string`);
        }
        values.push(value.value);
    }

    return crudService.desc(tableName).then(tableInfo => {
        let primaryKey = tableInfo.key;
        let valueFields = tableInfo.valueFields.split(',');
        let entry = new Entry();

        if (!fields) {
            if (values.length !== valueFields.length + 1) {
                throw new Error(`unmatched number of values, expected ${valueFields.length + 1} but got ${values.length}`);
            }

            for (var index = 0; index < valueFields.length; ++index) {
                entry.put(valueFields[index], values[index + 1]);
            }

            key = values[0];
        } else {
            valueFields.push(primaryKey);

            if (fields.length !== valueFields.length) {
                throw new Error(`unmatched number of columns, expected ${valueFields.length} but got ${fields.length}`);
            }

            if (fields.length !== values.length) {
                throw new Error(`unmatched number of values, expected ${fields.length} but got ${values.length}`);
            }

            for (let field of valueFields) {
                if (!fields.includes(field)) {
                    throw new Error(`missing field \`${field}\``);
                }
            }

            for (let index in fields) {
                if (fields[index] === primaryKey) {
                    key = values[index];
                } else {
                    entry.put(fields[index], values[index]);
                }
            }
        }

        let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);
        return crudService.insert(table, entry);
    });
}

function parseUpdate(ast) {
    let tableName = ast.table[0].table;

    return crudService.desc(tableName).then(tableInfo => {
        let primaryKey = tableInfo.key;
        let valueFields = tableInfo.valueFields.split(',');

        let where = ast.where;
        let condition = new Condition();
        parseWhere(where, condition);

        if (!condition.conditions[primaryKey] || !condition.conditions[primaryKey][ConditionOp.EQ]) {
            throw new Error(`value of primary key \`${tableInfo.key}\` should be specified in where clause`);
        }

        let key = condition.conditions[primaryKey][ConditionOp.EQ];

        let entry = new Entry();
        let columns = ast.set;
        for (let column of columns) {
            if (column.column === primaryKey) {
                throw new Error("primary key can't be updated");
            }

            if (!valueFields.includes(column.column)) {
                throw new Error(`there is no \`${column}\` field in table \`${tableName}\``);
            }

            if (column.value.type !== 'string') {
                throw new Error(`value of field \`${column.column}\` should be a string`);
            }

            entry.put(column.column, column.value.value);
        }

        let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);
        return crudService.update(table, entry, condition);
    });
}

function parseDelete(ast) {
    let from = ast.from;
    if (from.length !== 1) {
        throw new Error('delete from multiple tables is not supported yet');
    }

    let tableName = from[0].table;
    return crudService.desc(tableName).then(tableInfo => {
        let primaryKey = tableInfo.key;
        let where = ast.where;
        let condition = new Condition();
        parseWhere(where, condition);

        if (!condition.conditions[primaryKey] || !condition.conditions[primaryKey][ConditionOp.EQ]) {
            throw new Error(`value of primary key \`${tableInfo.key}\` should be provided in where clause`);
        }

        let key = condition.conditions[primaryKey][ConditionOp.EQ];
        let table = new Table(tableInfo.tableName, key, tableInfo.valueFields, tableInfo.optional);
        return crudService.remove(table, condition);
    });
}

interfaces.push(produceSubCommandInfo(
    {
        name: 'sql',
        describe: 'Using SQL-style syntax to execute CRUD opeartion',
        args: [
            {
                name: 'statement',
                options: {
                    type: 'string',
                    describe: 'Case-insensitive SQL statement\n' +
                        'Now support:\n' +
                        '\tcreate table -- create a new table\n' +
                        '\tselect -- select rows from a table via conditions\n' +
                        '\tinsert -- insert rows from a table with values\n' +
                        '\tupdate -- update rows from a table with values\n' +
                        '\tdelete -- delete rows from a table via conditions\n',
                }
            },
        ]
    },
    (argv) => {
        let statement = argv.statement;
        const sqlParser = new Parser();
        let ast = sqlParser.astify(statement, {
            database: 'MySQL'
        });

        if (ast.type === 'create' && ast.keyword === 'table') {
            return parseCreateTable(ast);
        } else if (ast.type === 'select') {
            return parseSelect(ast);
        } else if (ast.type === 'insert') {
            return parseInsert(ast);
        } else if (ast.type === 'update') {
            return parseUpdate(ast);
        } else if (ast.type === 'delete') {
            return parseDelete(ast);
        } else {
            throw new Error('unsupported SQL operation');
        }
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
                    describe: 'Name of the table',
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
