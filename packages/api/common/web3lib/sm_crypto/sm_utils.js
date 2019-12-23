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

var utils = exports
var BN = require('bn.js');
var crypto = require('crypto');

utils.strToBytes = strToBytes;
utils.hashToBN = hashToBN;
utils.random = random;

function strToBytes(s) {
  var ch, st, re = [];
  for (var i = 0; i < s.length; i++ ) {
    ch = s.charCodeAt(i);  // get char
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }
    while ( ch );
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat( st.reverse() );
  }
  return re;
}

function hashToBN(hash) {
  if (typeof hash == 'string') {
    return new BN(hash, 16);
  } else {
    var hex = '';
    for (var i = 0; i < hash.length; i++) {
      var b = hash[i].toString(16);
      if (b.length == 1) {
        hex += '0';
      }
      hex += b;
    }
    return new BN(hex, 16);
  }
}

/**
 * Generate cryptographic random value.
 *
 * @param {Number} n: byte length of the generated value
 */
function random(n) {
  return crypto.randomBytes(n).toString('hex')
}
