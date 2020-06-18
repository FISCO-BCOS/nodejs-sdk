pragma solidity ^0.5.10;

library DelegateCallLibary {
    function relatedVar() public returns (address) {
        return address(this);
    }
}

contract CallLibrary {
    function calling() public returns (address) {
        return DelegateCallLibary.relatedVar();
    }
}