pragma solidity ^0.5.10;

import "./ParallelContract.sol";

// A parallel contract example
contract ParallelOk is ParallelContract
{
    mapping (string => uint256) _balance;

     // Just an example, overflow is ok, use 'SafeMath' if needed
    function transfer(string memory from, string memory to, uint256 num) public
    {
        _balance[from] -= num;
        _balance[to] += num;
    }

    // Just for testing whether the parallel revert function is working well, no practical use
    function transferWithRevert(string memory from, string memory to, uint256 num) public
    {
        _balance[from] -= num;
        _balance[to] += num;
        require(num <= 100, 'revert');
    }

    function set(string memory name, uint256 num) public
    {
        _balance[name] = num;
    }

    function balanceOf(string memory name) public view returns (uint256)
    {
        return _balance[name];
    }

    // Register parallel function
    function enableParallel() public
    {
        // critical number is to define how many critical params from start
        registerParallelFunction("transfer(string,string,uint256)", 2); // critical: string string
        registerParallelFunction("set(string,uint256)", 1); // critical: string
    }

    // Disable register parallel function
    function disableParallel() public
    {
        unregisterParallelFunction("transfer(string,string,uint256)");
        unregisterParallelFunction("set(string,uint256)");
    }
}
