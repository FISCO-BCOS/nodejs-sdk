/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

class StatusCode {
    static getStatusMessage(status) {
        let message = '';
        switch (status) {
            case this.Success:
                message = 'success';
                break;
            case this.Unknown:
                message = 'unknown';
                break;
            case this.BadRLP:
                message = 'bad RLP';
                break;
            case this.InvalidFormat:
                message = 'invalid format';
                break;
            case this.OutOfGasIntrinsic:
                message = 'out of gas intrinsic';
                break;
            case this.InvalidSignature:
                message = 'invalid signature';
                break;
            case this.InvalidNonce:
                message = 'invalid nonce';
                break;
            case this.NotEnoughCash:
                message = 'not enough cash';
                break;
            case this.OutOfGasBase:
                message = 'out of gas base';
                break;
            case this.BlockGasLimitReached:
                message = 'block gas limit reached';
                break;
            case this.BadInstruction:
                message = 'bad instruction';
                break;
            case this.BadJumpDestination:
                message = 'bad jump destination';
                break;
            case this.OutOfGas:
                message = 'out of gas';
                break;
            case this.OutOfStack:
                message = 'out of stack';
                break;
            case this.StackUnderflow:
                message = 'stack underflow';
                break;
            case this.NonceCheckFail:
                message = 'nonce check fail';
                break;
            case this.BlockLimitCheckFail:
                message = 'block limit check fail';
                break;
            case this.FilterCheckFail:
                message = 'filter check fail';
                break;
            case this.NoDeployPermission:
                message = 'no deploy permission';
                break;
            case this.NoCallPermission:
                message = 'no call permission';
                break;
            case this.NoTxPermission:
                message = 'no tx permission';
                break;
            case this.PrecompiledError:
                message = 'precompiled error';
                break;
            case this.RevertInstruction:
                message = 'revert instruction';
                break;
            case this.InvalidZeroSignatureFormat:
                message = 'invalid zero signature format';
                break;
            case this.AddressAlreadyUsed:
                message = 'address already used';
                break;
            case this.PermissionDenied:
                message = 'permission denied';
                break;
            case this.CallAddressError:
                message = 'call address error';
                break;
            default:
                message = `unknown status code:${status}`;
                break;
        }

        return message;
    }
}

StatusCode.Success = '0x0';
StatusCode.Unknown = '0x1';
StatusCode.BadRLP = '0x2';
StatusCode.InvalidFormat = '0x3';
StatusCode.OutOfGasIntrinsic = '0x4';
StatusCode.InvalidSignature = '0x5';
StatusCode.InvalidNonce = '0x6';
StatusCode.NotEnoughCash = '0x7';
StatusCode.OutOfGasBase = '0x8';
StatusCode.BlockGasLimitReached = '0x9';
StatusCode.BadInstruction = '0xa';
StatusCode.BadJumpDestination = '0xb';
StatusCode.OutOfGas = '0xc';
StatusCode.OutOfStack = '0xd';
StatusCode.StackUnderflow = '0xe';
StatusCode.NonceCheckFail = '0xf';
StatusCode.BlockLimitCheckFail = '0x10';
StatusCode.FilterCheckFail = '0x11';
StatusCode.NoDeployPermission = '0x12';
StatusCode.NoCallPermission = '0x13';
StatusCode.NoTxPermission = '0x14';
StatusCode.PrecompiledError = '0x15';
StatusCode.RevertInstruction = '0x16';
StatusCode.InvalidZeroSignatureFormat = '0x17';
StatusCode.AddressAlreadyUsed = '0x18';
StatusCode.PermissionDenied = '0x19';
StatusCode.CallAddressError = '0x1a';

module.exports.StatusCode = StatusCode;
