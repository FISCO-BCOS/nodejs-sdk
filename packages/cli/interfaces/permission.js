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

const produceSubCommandInfo = require('./base').produceSubCommandInfo;
const PermissionService = require('../../api').PermissionService;

let interfaces = [];
let permissionService = new PermissionService();

interfaces.push(produceSubCommandInfo(
    {
        name: 'grantPermissionManager',
        describe: 'Grant permission for permission configuration by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.grantPermissionManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'listPermissionManager',
        describe: 'Query permission information for permission configuration',
    },
    () => {
        return permissionService.listPermissionManager();
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'revokePermissionManager',
        describe: 'Revoke permission for permission configuration by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.revokePermissionManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'grantUserTableManager',
        describe: 'Grant permission for user table by table name and address',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'The name of a table'
                }
            },
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let address = argv.address;

        return permissionService.grantUserTableManager(tableName, address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'listUserTableManager',
        describe: 'Query permission for user table information',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'The name of a table'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;

        return permissionService.listUserTableManager(tableName);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'revokeUserTableManager',
        describe: 'Revoke permission for user table by table name and address',
        args: [
            {
                name: 'tableName',
                options: {
                    type: 'string',
                    describe: 'The name of a table'
                }
            },
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let tableName = argv.tableName;
        let address = argv.address;

        return permissionService.revokeUserTableManager(tableName, address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'grantDeployAndCreateManager',
        describe: 'Grant permission for deploy contract and create user table by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.grantDeployAndCreateManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'listDeployAndCreateManager',
        describe: 'Query permission information for deploy contract and create user table',
    },
    () => {
        return permissionService.listDeployAndCreateManager();
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'revokeDeployAndCreateManager',
        describe: 'Revoke permission for deploy contract and create user table by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.revokeDeployAndCreateManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'grantNodeManager',
        describe: 'Grant permission for node configuration by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.grantNodeManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'listNodeManager',
        describe: 'Query permission information for node configuration',
    },
    () => {
        return permissionService.listNodeManager();
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'revokeNodeManager',
        describe: 'Revoke permission for node configuration by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.revokeNodeManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'grantCNSManager',
        describe: 'Grant permission for CNS by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.grantCNSManager(address);
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'listCNSManager',
        describe: 'Query permission information for CNS',
    },
    () => {
        return permissionService.listCNSManager();
    })
);

interfaces.push(produceSubCommandInfo(
    {
        name: 'revokeCNSManager',
        describe: 'Revoke permission for CNS by address',
        args: [
            {
                name: 'address',
                options: {
                    type: 'string',
                    describe: '20 Bytes - The address of a tx.origin'
                }
            }
        ]
    },
    (argv) => {
        let address = argv.address;

        return permissionService.revokeCNSManager(address);
    })
);

module.exports.interfaces = interfaces;