#!/bin/bash

curl -LO https://raw.githubusercontent.com/FISCO-BCOS/FISCO-BCOS/master/tools/build_chain.sh && chmod u+x build_chain.sh
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i -g
bash nodes/127.0.0.1/start_all.sh
sed -i.bak 's?ECDSA?SM_CRYPTO?' packages/cli/conf/config.json
sed -i.bak 's?alice.pem?sm_crypto.pem?' packages/cli/conf/config.json
sed -i.bak 's?bob.pem?sm_crypto.pem?' packages/cli/conf/config.json
sed -i.bak 's?cherry.p12?sm_crypto.pem?' packages/cli/conf/config.json
sed -i.bak 's?p12?pem?' packages/cli/conf/config.json
rm packages/cli/conf/config.json.bak
cp nodes/127.0.0.1/sdk/ca.crt nodes/127.0.0.1/sdk/sdk.crt nodes/127.0.0.1/sdk/sdk.key packages/cli/conf/authentication
cd packages/cli 
./cli.js getClientVersion
./cli.js deploy HelloWorldV5

cd ../..
cp nodes/127.0.0.1/sdk/ca.crt nodes/127.0.0.1/sdk/sdk.crt nodes/127.0.0.1/sdk/sdk.key test/conf/authentication
sed -i.bak 's?ECDSA?SM_CRYPTO?' test/conf/config.json
sed -i.bak 's?alice.pem?sm_crypto.pem?' test/conf/config.json
sed -i.bak 's?bob.pem?sm_crypto.pem?' test/conf/config.json
npm test -- --timeout 5000
