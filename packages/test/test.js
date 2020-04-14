/*use 'esversion: 6'*/
/*jshint node: true */
/*jshint -W119 */

const Configuration = require('../api').Configuration;
Configuration.setConfig('./conf/config.json');

const Web3jService = new require('../api').Web3jService;
const web3j = new Web3jService();
const compile = require('../api').compile;
const contractPath = "./contracts/HelloWorld.sol";

let contractClass = compile(contractPath);
let helloWorld = contractClass.newInstance();

async function run() {
    let address = await helloWorld.$deploy(web3j);
    console.log("HelloWorld contract depolyed at " + address);
    let ret = await helloWorld.get();
    console.log('origin name: ' + ret[0]);
    await helloWorld.set("你好，世界！");
    ret = await helloWorld.get();
    console.log('new name: ' + ret[0]);
}

run().catch((reason) => {
    console.log(reason);
});


