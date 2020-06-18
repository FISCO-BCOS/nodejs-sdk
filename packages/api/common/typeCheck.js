const assert = require('assert');
const isArray = require('isarray');

module.exports.Neg = 0;
module.exports.Str = 1;
module.exports.Obj = 2;
module.exports.Bool = 3;
module.exports.StrNeg = 4;
module.exports.Addr = 5;
module.exports.ArrayList = 6;
module.exports.Any = 7;
module.exports.Num = 8;

_types = {
    [module.exports.Neg]: 'negative integer',
    [module.exports.Str]: 'string',
    [module.exports.Obj]: 'object',
    [module.exports.Bool]: 'boolean',
    [module.exports.StrNeg]: 'negative integer',
    [module.exports.Addr]: 'address',
    [module.exports.ArrayList]: 'array',
    [module.exports.Any]: 'any',
    [module.exports.Num]: 'number'
};

/**
 * @param {list} args Arguments list, it usually be `arguments` object of a function
 * @param {list} type Type list, the expected type of each argument
 */
module.exports.check = function (args, ...types) {
    if ((typeof args !== typeof arguments) && !isArray(args)) {
        args = [args];
    }

    if (args.length !== types.length) {
        throw new TypeError(`unmatch number of arguments, expected ${types.length} but got ${args.length}`);
    }

    for (let index in args) {
        if (typeof types[index] === 'number') {
            assert(types[index] in _types);

            switch (types[index]) {
                case exports.Number: {
                    if (typeof args[index] !== 'number' || !Number.isInteger(args[index])) {
                        throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${_types[types[index]]} but got \`${args[index]}\``);
                    }

                    if (args[index] < Number.MIN_SAFE_INTEGER || args[index] > Number.MAX_SAFE_INTEGER) {
                        throw new RangeError(`invalid range of argument at position ${parseInt(index) + 1}, the argument should be within the scope of [${Number.MIN_SAFE_INTEGER}, ${Number.MAX_SAFE_INTEGER}]`);
                    }

                    break;
                }
                case exports.Neg: {
                    if (typeof args[index] !== 'number' || !Number.isInteger(args[index])) {
                        throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${_types[types[index]]} but got \`${args[index]}\``);
                    }

                    if (args[index] < 0 || args[index] > Number.MAX_SAFE_INTEGER) {
                        throw new RangeError(`invalid range of argument at position ${parseInt(index) + 1}, the argument should be within the scope of [0, ${Number.MAX_SAFE_INTEGER}]`);
                    }

                    break;
                }
                case exports.StrNeg: {
                    let intReg = /^(0x)?(\d|[a-fA-F])+$/;
                    if (!intReg.test(args[index])) {
                        throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${_types[types[index]]} but got \`${args[index]}\``);
                    }

                    let number = parseInt(args[index], 10) || parseInt(args[index], 16);

                    if (Number.isNaN(number) || number < 0 || number > Number.MAX_SAFE_INTEGER) {
                        throw new RangeError(`invalid range of argument at position ${parseInt(index) + 1}, the argument should be within the scope of [0, ${Number.MAX_SAFE_INTEGER}]`);
                    }

                    break;
                }
                case exports.Addr: {
                    if (typeof args[index] != 'string') {
                        throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${_types[types[index]]} but got \`${args[index]}\``);
                    }

                    if (!args[index].startsWith('0x')) {
                        throw new SyntaxError(`invalid address of argument at position ${parseInt(index) + 1}, the argument should start with \`0x\``);
                    }

                    if (args[index].length != 42) {
                        throw new SyntaxError(`invalid address of argument at position ${parseInt(index) + 1}, the argument should be at a length of 20 bytes`);
                    }

                    break;
                }
                case exports.ArrayList: {
                    if (!isArray(args[index])) {
                        throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${_types[types[index]]} but got \`${args[index]}\``);
                    }

                    break;
                }
                case exports.Any:
                    break;
                default: {
                    if (typeof args[index] !== _types[types[index]]) {
                        throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${_types[types[index]]} but got \`${args[index]}\``);
                    }
                    break;
                }
            }
        } else if (typeof types[index] === 'function') {
            if (!(args[index] instanceof types[index])) {
                let functionName = types[index].toString();
                if (functionName.startsWith('class')) {
                    functionName = functionName.substr('class '.length);
                    functionName = functionName.substr(0, functionName.indexOf('{')).trim();
                } else {
                    functionName = functionName.substr('function '.length);
                    functionName = functionName.substr(0, functionName.indexOf('(')).trim();
                }

                throw new SyntaxError(`invalid argument at position ${parseInt(index) + 1}, expected instance of ${functionName} but got \`${args[index]}\``);
            }
        }
    }
};
