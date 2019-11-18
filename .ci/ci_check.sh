#!/bin/bash

curl -LO https://raw.githubusercontent.com/FISCO-BCOS/FISCO-BCOS/master/tools/build_chain.sh && chmod u+x build_chain.sh
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i
bash nodes/127.0.0.1/start_all.sh
sed -i.bak 's?/path/to/sdk/key?../../../nodes/127.0.0.1/sdk/node.key?' packages/cli/conf/config.json
sed -i.bak 's?/path/to/sdk/certificate?../../../nodes/127.0.0.1/sdk/node.crt?' packages/cli/conf/config.json
sed -i.bak 's?/path/to/CA/certificate?../../../nodes/127.0.0.1/sdk/ca.crt?' packages/cli/conf/config.json
rm packages/cli/conf/config.json.bak
cd packages/cli 
./cli.js getClientVersion
./cli.js deploy HelloWorld
