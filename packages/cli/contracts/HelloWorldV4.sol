pragma solidity ^0.4.23;

contract HelloWorldV4 {
    string name;

    constructor(string n) public {
        name = n;
    }

    function get() public view returns (string) {
        return name;
    }

    function set(string n) public {
        name = n;
    }
}
