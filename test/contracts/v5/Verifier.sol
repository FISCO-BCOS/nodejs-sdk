pragma solidity ^0.5.0;

import './BN256G2.sol';

contract Verifier {
    function healthCheck() public returns (uint256) {
        return BN256G2.healthCheck();
    }
}

