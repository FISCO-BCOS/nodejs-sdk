pragma solidity ^0.4.23;

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