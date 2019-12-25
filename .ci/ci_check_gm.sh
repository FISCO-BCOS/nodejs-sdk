#!/bin/bash

curl -LO https://raw.githubusercontent.com/FISCO-BCOS/FISCO-BCOS/master/tools/build_chain.sh && chmod u+x build_chain.sh
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i -g
bash nodes/127.0.0.1/start_all.sh
sed -i.bak 's?ECDSA?SM_CRYPTO?' packages/cli/conf/config.json
sed -i.bak 's?ecdsa.pem?sm_crypto.pem?' packages/cli/conf/config.json
rm packages/cli/conf/config.json.bak
cp nodes/127.0.0.1/sdk/* packages/cli/conf/
cd packages/cli 
./cli.js getClientVersion
./cli.js deploy HelloWorld
