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

const TransactionError = require('../common/exceptions').TransactionError;
const StatusCode = require('../common/statusCode').StatusCode;
const utils = require('../common/utils');

module.exports.TableName = {
    SYS_TABLE: '_sys_tables_',
    USER_TABLE_PREFIX: '_user_',
    SYS_TABLE_ACCESS: '_sys_table_access_',
    SYS_CONSENSUS: '_sys_consensus_',
    SYS_CNS: '_sys_cns_',
    SYS_CONFIG: '_sys_config_',
};

class OutputCode {
    static getOutputMessage(output) {
        let message = '';
        switch (output) {
            case this.Success:
                message = 'success';
                break;
            case this.PermissionDenied:
                message = 'permission denied';
                break;
            case this.TableExist:
                message = 'table name already exist';
                break;
            case this.TableNameAndAddressExist:
                message = 'table name and address already exist';
                break;
            case this.TableNameAndAddressNotExist:
                message = 'table name and address does not exist';
                break;
            case this.InvalidNodeId:
                message = 'invalid node ID';
                break;
            case this.LastSealer:
                message = 'the last sealer cannot be removed';
                break;
            case this.P2PNetwork:
                message = 'the node is not reachable';
                break;
            case this.GroupPeers:
                message = 'the node is not a group peer';
                break;
            case this.SealerList:
                message = 'the node is already in the sealer list';
                break;
            case this.ObserverList:
                message = 'the node is already in the observer list';
                break;
            case this.ContractNameAndVersionExist:
                message = 'contract name and version already exist';
                break;
            case this.VersionExceeds:
                message = 'version string length exceeds the maximum limit';
                break;
            case this.InvalidKey:
                message = 'invalid configuration entry';
                break;
            default:
                message = `unknown output code:${output}`;
                break;
        }

        return message;
    }
}

OutputCode.Success = 0;
OutputCode.PermissionDenied = -50000;
OutputCode.TableExist = -50001;
OutputCode.TableNameAndAddressExist = -51000;
OutputCode.TableNameAndAddressNotExist = -51001;
OutputCode.InvalidNodeId = -51100;
OutputCode.LastSealer = -51101;
OutputCode.P2PNetwork = -51102;
OutputCode.GroupPeers = -51103;
OutputCode.SealerList = -51104;
OutputCode.ObserverList = -51105;
OutputCode.ContractNameAndVersionExist = -51200;
OutputCode.VersionExceeds = -51201;
OutputCode.InvalidKey = -51300;

module.exports.OutputCode = OutputCode;

module.exports.handleReceipt = function (receipt, abi) {
    if (receipt.status != '0x0') {
        throw new TransactionError(StatusCode.getStatusMessage(receipt.status));
    } else {
        if (!receipt.output) {
            throw new TransactionError('transaction failed');
        } else {
            return utils.decodeMethod(abi, receipt.output);
        }
    }
};