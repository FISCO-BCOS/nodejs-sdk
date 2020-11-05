const ethers = require("ethers");
const SM3 = require("../common/web3lib/sm_crypto/sm_sm3");
const ENCRYPT_TYPE = require("../common/configuration/constant").ENCRYPT_TYPE;

/**
 * Link placeholder bytecode of contracts with external deployed library link
 * @param {Enum} encryptType
 * @param {String} bin
 * @param {Object} linkReferences
 * @param {String} libraryName
 * @param {String} libraryAddress
 *
 */
const linkLibrary = (
  encryptType,
  bin,
  linkReferences,
  libraryName,
  libraryAddress
) => {
  const address = libraryAddress.replace("0x", "");

  let qualifyingLibraryName;

  // We parse the bytecode's linkedReferences in search of the correct path of the library (in order to construct a correctly formatted qualifyingLibraryName)
  for (const entry of Object.entries(linkReferences)) {
    if (libraryName in entry[1]) {
      // From Solidity docs: Note that the fully qualified library name is the path of its source file and the library name separated by :.
      // qualifyingLibraryName = `${path.basename(entry[0])}:${libraryName}`
      qualifyingLibraryName = `${entry[0]}:${libraryName}`;
      break;
    }
  }
  if (typeof(qualifyingLibraryName) === "undefined") {
    throw new Error(
      `linkReference for library '${libraryName}' not found in contract's bytecode.`
    );
  }

  const encodedLibraryName =
    encryptType === ENCRYPT_TYPE.ECDSA
      ? ethers.utils
          .solidityKeccak256(["string"], [qualifyingLibraryName])
          .slice(2, 36)
      : new SM3().sum(qualifyingLibraryName, "hex").slice(0, 34);

  // eslint-disable-next-line no-restricted-syntax
  const pattern = new RegExp(`_+\\$${encodedLibraryName}\\$_+`, "g");
  if (!pattern.exec(bin)) {
    throw new Error(
      `Can't find the encoding ${encodedLibraryName} of ${libraryName}'s qualifying library name ${qualifyingLibraryName} in the contract's bytecode. It's possible that the library's path (i.e. the preimage) is incorrect.`
    );
  }

  return bin.replace(pattern, address);
};

module.exports.linkLibrary = linkLibrary;
