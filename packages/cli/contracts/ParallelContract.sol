pragma solidity ^0.5.10;

contract ParallelConfigPrecompiled
{
    function registerParallelFunctionInternal(address, string memory, uint256) public returns (int);
    function unregisterParallelFunctionInternal(address, string memory) public returns (int);
}

contract ParallelContract
{
    ParallelConfigPrecompiled precompiled = ParallelConfigPrecompiled(0x1006);

    function registerParallelFunction(string memory functionName, uint256 criticalSize) public
    {
        precompiled.registerParallelFunctionInternal(address(this), functionName, criticalSize);
    }

    function unregisterParallelFunction(string memory functionName) public
    {
        precompiled.unregisterParallelFunctionInternal(address(this), functionName);
    }

    function enableParallel() public;
    function disableParallel() public;
}
