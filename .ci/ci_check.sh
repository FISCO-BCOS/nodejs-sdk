#!/bin/bash

curl -LO https://raw.githubusercontent.com/FISCO-BCOS/FISCO-BCOS/master/tools/build_chain.sh && chmod u+x build_chain.sh
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i
bash nodes/127.0.0.1/start_all.sh
cp nodes/127.0.0.1/sdk/* packages/cli/conf/authentication
cd packages/cli 
./cli.js getClientVersion
./cli.js deploy HelloWorldV4

cd ../..
cp nodes/127.0.0.1/sdk/* test/conf/authentication
npm test -- --timeout 5000
