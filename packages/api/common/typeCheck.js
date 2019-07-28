const assert = require('assert');
const isArray = require('isarray');

module.exports.number = 0;
module.exports.string = 1;
module.exports.object = 2;
module.exports.boolean = 3;

_types = {
    [module.exports.number]: 'number',
    [module.exports.string]: 'string',
    [module.exports.object]: 'object',
    [module.exports.boolean]: 'boolean'
};

/**
 * @param {list} args Arguments list, it usually be `arguments` object of a function
 * @param {list} type Type list, the expected type of each argument
 */
module.exports.check = function (args, ...types) {
    if((typeof args !== typeof arguments) && !isArray(args)) {
        args = [args];
    }

    if(args.length !== types.length){
        throw new TypeError(`unmatch number of arguments, expected ${types.length} but got ${args.length}`);
    }

    for (let index in args) {
        if(typeof types[index] === 'number') {
            assert(types[index] in _types);

            if(typeof args[index] !== _types[types[index]]) {
                throw new TypeError(`invalid parameter at position ${index}, expected ${_types[types[index]]} but got ${typeof args[index]}`)
            }
        } else if(typeof types[index] === 'function') {
            if(!(args[index] instanceof types[index])) {
                let functionName = types[index].toString();
                if (functionName.startsWith('class')) {
                    functionName = functionName.substr('class '.length);
                    functionName = functionName.substr(0, functionName.indexOf('{')).trim();
                } else {
                    functionName = functionName.substr('function '.length);
                    functionName = functionName.substr(0, functionName.indexOf('(')).trim();
                }

                throw new TypeError(`invalid parameter at position ${index}, expected instance of ${functionName} but got ${typeof args[index]}`)
            }
        }
    }
};
