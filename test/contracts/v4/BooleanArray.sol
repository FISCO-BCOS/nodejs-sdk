pragma solidity ^0.4.23;

contract BooleanArray {
    string name;

    function noop(bool[2] memory a, bool[2] memory b) public returns (bool) {
        return b[0];
    }
}
