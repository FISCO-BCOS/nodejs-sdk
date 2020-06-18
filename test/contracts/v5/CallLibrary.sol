pragma solidity ^0.5.1;

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