#!/bin/bash

curl -LO https://raw.githubusercontent.com/FISCO-BCOS/FISCO-BCOS/master/tools/build_chain.sh && chmod u+x build_chain.sh
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i -g
bash nodes/127.0.0.1/start_all.sh
sed -i.bak 's?ECDSA?SM_CRYPTO?' packages/cli/conf/config.json
sed -i.bak 's?alice.pem?sm_crypto.pem?' packages/cli/conf/config.json
sed -i.bak 's?bob.pem?sm_crypto.pem?' packages/cli/conf/config.json
rm packages/cli/conf/config.json.bak
cp nodes/127.0.0.1/sdk/* packages/cli/conf/authentication
cd packages/cli 
./cli.js getClientVersion
./cli.js deploy HelloWorldV5

cd ../..
cp nodes/127.0.0.1/sdk/* test/conf/authentication
sed -i.bak 's?ECDSA?SM_CRYPTO?' test/conf/config.json
sed -i.bak 's?alice.pem?sm_crypto.pem?' test/conf/config.json
sed -i.bak 's?bob.pem?sm_crypto.pem?' test/conf/config.json
npm test -- --timeout 5000
