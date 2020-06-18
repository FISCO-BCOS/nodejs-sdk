pragma solidity ^0.4.23;

contract EventTest {
    event event1(string s);
    event event2(string s, int256 indexed n);
    event event3(string indexed s, int256 indexed n);
    event event4(address a);
    event event5(address indexed a);
    event event6(int256 indexed n, bool b, string indexed s);

    function method1(string s) public {
        emit event1(s);
    }

    function method2(string s, int256 n) public {
        emit event2(s, n);
    }

    function method3(string s, int256 n) public {
        emit event3(s, n);
    }

    function method4(address a) public {
        emit event4(a);
    }

    function method5(address a) public {
        emit event5(a);
    }

    function method6(int256 n, bool b, string s) public {
        emit event6(n, b, s);
    }
}
