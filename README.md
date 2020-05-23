# FISCO BCOS Node.js SDK

![logo](https://github.com/FISCO-BCOS/FISCO-BCOS/raw/master/docs/images/FISCO_BCOS_Logo.svg?sanitize=true)

[![Build Status](https://travis-ci.org/FISCO-BCOS/nodejs-sdk.svg?branch=master)](https://travis-ci.org/FISCO-BCOS/nodejs-sdk)
[![GitHub license](https://img.shields.io/badge/%20license-Apache%202.0-green)](https://github.com/FISCO-BCOS/nodejs-sdk/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/FISCO-BCOS/nodejs-sdk.svg)](https://github.com/FISCO-BCOS/nodejs-sdk/issues)
[![Code Lines](https://tokei.rs/b1/github/FISCO-BCOS/nodejs-sdk)](https://github.com/FISCO-BCOS/nodejs-sdk)

---

Node.js SDK为联盟链平台[FISCO BCOS](https://github.com/FISCO-BCOS/FISCO-BCOS/tree/master)提供面向Node.js语言的应用程序接口，使用Node.js SDK可以简单快捷地开发基于FISCO-BCOS的Node.js应用。Node.js SDK**仅支持**v2.0.0及以上的[FISCO BCOS](https://github.com/FISCO-BCOS/FISCO-BCOS/tree/master)版本。

## 关键特性

- 提供调用[JSON-RPC接口](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/api.html)的Node.js API
- 提供调用[预编译合约接口](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/design/virtual_machine/precompiled.html)的Node.js API
- 提供合约事件推送相关的Node.js API
- 提供编译、部署、调用0.4.x及0.5.x版本Solidity合约的Node.js API
- 支持国密模式
- 与FISCO BCOS节点的通信方式采用更安全的双向认证[Channel协议](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/design/protocol_description.html#channelmessage)
- 提供简单易用的CLI（Command-Line Interface）工具，供用户在命令行中方便地部署及调用合约、管理区块链状态、执行CRUD操作等
- 支持Windows、Linux及MacOS操作系统

目录
=================

  - [一、SDK部署](#%e4%b8%80sdk%e9%83%a8%e7%bd%b2)
    - [1.1 环境要求](#11-%e7%8e%af%e5%a2%83%e8%a6%81%e6%b1%82)
    - [1.2 获取源代码](#12-%e8%8e%b7%e5%8f%96%e6%ba%90%e4%bb%a3%e7%a0%81)
    - [1.3 部署](#13-%e9%83%a8%e7%bd%b2)
  - [二、CLI工具使用](#%e4%ba%8ccli%e5%b7%a5%e5%85%b7%e4%bd%bf%e7%94%a8)
    - [2.1 快速建链（可选）](#21-%e5%bf%ab%e9%80%9f%e5%bb%ba%e9%93%be%e5%8f%af%e9%80%89)
    - [2.2 配置](#22-%e9%85%8d%e7%bd%ae)
    - [2.3 开启命令自动补全](#23-%e5%bc%80%e5%90%af%e5%91%bd%e4%bb%a4%e8%87%aa%e5%8a%a8%e8%a1%a5%e5%85%a8)
    - [2.4 使用示例](#24-%e4%bd%bf%e7%94%a8%e7%a4%ba%e4%be%8b)
      - [2.4.1 查看使用帮助](#241-%e6%9f%a5%e7%9c%8b%e4%bd%bf%e7%94%a8%e5%b8%ae%e5%8a%a9)
      - [2.4.2 查看CLI工具能够调用的命令及对应的功能](#242-%e6%9f%a5%e7%9c%8bcli%e5%b7%a5%e5%85%b7%e8%83%bd%e5%a4%9f%e8%b0%83%e7%94%a8%e7%9a%84%e5%91%bd%e4%bb%a4%e5%8f%8a%e5%af%b9%e5%ba%94%e7%9a%84%e5%8a%9f%e8%83%bd)
      - [2.4.3 查看所连FISCO BCOS节点的版本](#243-%e6%9f%a5%e7%9c%8b%e6%89%80%e8%bf%9efisco-bcos%e8%8a%82%e7%82%b9%e7%9a%84%e7%89%88%e6%9c%ac)
      - [2.4.4 显示外部账户](#244-%e6%98%be%e7%a4%ba%e5%a4%96%e9%83%a8%e8%b4%a6%e6%88%b7)
      - [2.4.5 获取当前的块高](#245-%e8%8e%b7%e5%8f%96%e5%bd%93%e5%89%8d%e7%9a%84%e5%9d%97%e9%ab%98)
      - [2.4.6 部署CLI工具自带的HelloWorld合约](#246-%e9%83%a8%e7%bd%b2cli%e5%b7%a5%e5%85%b7%e8%87%aa%e5%b8%a6%e7%9a%84helloworld%e5%90%88%e7%ba%a6)
      - [2.4.7 调用HelloWorld合约的set接口](#247-%e8%b0%83%e7%94%a8helloworld%e5%90%88%e7%ba%a6%e7%9a%84set%e6%8e%a5%e5%8f%a3)
      - [2.4.8 调用HelloWorld合约的get接口](#248-%e8%b0%83%e7%94%a8helloworld%e5%90%88%e7%ba%a6%e7%9a%84get%e6%8e%a5%e5%8f%a3)
      - [2.4.9 CRUD操作](#249-crud%e6%93%8d%e4%bd%9c)
      - [2.4.10 更多CLI子命令使用帮助](#2410-%e6%9b%b4%e5%a4%9acli%e5%ad%90%e5%91%bd%e4%bb%a4%e4%bd%bf%e7%94%a8%e5%b8%ae%e5%8a%a9)
  - [三、API列表](#%e4%b8%89api%e5%88%97%e8%a1%a8)
    - [3.1 API调用约定](#31-api%e8%b0%83%e7%94%a8%e7%ba%a6%e5%ae%9a)
    - [3.2 Web3jService](#32-web3jservice)
    - [3.3 PermissionService](#33-permissionservice)
    - [3.4 CNSService](#34-cnsservice)
    - [3.5 SystemConfigService](#35-systemconfigservice)
    - [3.6 ConsensusService](#36-consensusservice)
    - [3.6 CRUDService](#36-crudservice)
    - [3.7 compile](#37-compile)
    - [3.8 ContractClass](#38-contractclass)
    - [3.8 合约对象](#38-%e5%90%88%e7%ba%a6%e5%af%b9%e8%b1%a1)
    - [3.9 EventLogService](#39-eventlogservice)
  - [四、Node.js SDK配置项说明](#%e5%9b%9bnodejs-sdk%e9%85%8d%e7%bd%ae%e9%a1%b9%e8%af%b4%e6%98%8e)
  - [五、贡献代码](#%e4%ba%94%e8%b4%a1%e7%8c%ae%e4%bb%a3%e7%a0%81)
  - [六、加入我们的社区](#%e5%85%ad%e5%8a%a0%e5%85%a5%e6%88%91%e4%bb%ac%e7%9a%84%e7%a4%be%e5%8c%ba)
  - [七、License](#%e4%b8%83license)

## 一、SDK部署

### 1.1 环境要求

- Node.js开发环境
  - Node.js >= 8.10.0
  - npm >= 5.6.0

  如果您没有部署过Node.js环境，可以参考下列部署方式：

  - 如果您使用Linux或MacOS：

    推荐使用[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)快速部署，使用nvm也能够避免潜在的导致Node.js SDK部署失败的权限问题。以部署Node.js 8为例，部署步骤如下：

      ```bash
      # 使用curl命令或wget命令安装nvm
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
      wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

      # 加载nvm配置
      source ~/.$(basename $SHELL)rc

      # 安装Node.js 8
      nvm install 8

      # 将Node.js 8设置为默认Node.js版本
      nvm use 8
      ```

  - 如果您使用Windows：

    请前往Node.js[官网](https://nodejs.org/en/download/)按照说明下载Windows安装包进行安装。

- 基本开发组件
  - Python 2（Windows、Linux及MacOS需要）
  - g++（Linux及MacOS需要）
  - make（Linux及MacOS需要）
  - Git（Windows、Linux及MacOS需要）
  - Git bash（仅Windows需要）
  - MSBuild构建环境（仅Windows需要）

  如果您使用Windows且没有部署过MSBuild构建环境，推荐在Windows PowerShell（管理员）中执行以下命令部署：

  ```bash
  npm install --global --production windows-build-tools
  ```

  该命令会下载约1GB的依赖项，整个过程可能会持续数十分钟，请耐心等待。

  **请注意**：如果您使用Windows，则若无无特殊说明，本文之后所提到的命令均需要在Git bash中执行

- FISCO BCOS：请参考FISCO BCOS[环境搭建教程](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/installation.html#fisco-bcos)

### 1.2 获取源代码

```bash
git clone https://github.com/FISCO-BCOS/nodejs-sdk.git
```

### 1.3 部署

**请注意**：如果您的网络中使用了代理，请先按照如下方式为npm配置代理。如果没有使用代理，请忽略。

```bash
npm config set proxy <your proxy>
npm config set https-proxy <your proxy>
```

**请注意**：如果您所使用的网络不能顺利访问npm官方镜像，请按照如下方式更换镜像源，如淘宝：

```bash
npm config set registry https://registry.npm.taobao.org
```

```bash
# 部署过程中请确保能够访问外网以能够安装第三方依赖包
cd nodejs-sdk
npm install
npm run repoclean
npm run bootstrap
```

## 二、CLI工具使用

用户即使不开发应用程序，也可以使用Node.js SDK中自带CLI工具在命令行中方便快捷地部署及调用合约、管理区块链状态、执行CRUD操作等。CLI工具也能够方便地嵌入到命令行脚本中，进行简单的应用开发。同时，CLI工具完全基于在Node.js SDK提供的API的开发而成，可作为一个展示如何使用Node.js SDK API进行二次开发的Demo。

### 2.1 快速建链（可选）

**请注意**：若您的系统中已经搭建了FISCO BCOS链，请跳过本节。

```bash
# 获取建链脚本
curl -LO https://github.com/FISCO-BCOS/FISCO-BCOS/releases/download/`curl -s https://api.github.com/repos/FISCO-BCOS/FISCO-BCOS/releases | grep "\"v2\.[0-9]\.[0-9]\"" | sort -u | tail -n 1 | cut -d \" -f 4`/build_chain.sh && chmod u+x build_chain.sh
# 在本地建一个4节点的FISCO BCOS链（如果需要搭建国密FISCO BCOS链，需要在命令中加入`-g`选项）
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i
# 启动FISCO BCOS链
bash nodes/127.0.0.1/start_all.sh
# 将证书文件拷贝至CLI工具的证书配置目录下
cp nodes/127.0.0.1/* packages/cli/conf/authentication
```

### 2.2 配置

CLI工具的配置文件位于`packages/cli/conf/config.json`，该配置文件用于初始化Node.js SDK，如需修改配置项请修改此文件。Node.js SDK的配置项包括：

- 加密算法类型

    加密算法类型配置位于配置文件的`encryptType`配置项中。如果您需要连接国密版FISCO BCOS节点，请将该配置项设置为`"SM_CRYPTO"`，否则请将该设置项设置为`"ECDSA"`。

- 账户

    账户配置位于配置文件的`accounts`配置项中。Node.js SDK支持同时加载多个账户，每个账户由账户名及对应的私钥组成。对于单个账户，您可以直接指定一个随机数（随机数的要求见『Node.js SDK配置项说明』一节）作为私钥，但更一般地，您也可以指定指定私钥文件以让SDK加载私钥。国密私钥文件可以使用[get_gm_account.sh](https://raw.githubusercontent.com/FISCO-BCOS/console/master/tools/get_gm_account.sh)脚本工具生成，非国密私钥文件可以使用[get_account.sh](https://raw.githubusercontent.com/FISCO-BCOS/console/master/tools/get_account.sh)脚本工具生成。请您确保所使用的私钥文件的类型与`encryptType`配置项中指定的加密算法类型一致。

- 证书

    证书配置位于配置文件的`authentication`配置项中。您需要根据您实际使用的证书文件的路径修改该配置项的`key`、`cert`及`ca`配置项，其中`key`为SDK私钥文件的路径，`cert`为SDK证书文件的路径，`ca`为链根证书文件的路径，这些文件可以由[建链脚本](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/manual/build_chain.html)或[企业级部署工具](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/enterprise_tools/index.html)自动生成，具体的生成方式及文件位置请参阅上述工具的说明文档。

- 节点IP及Channel通信端口

    节点IP及Channel通信端口配置位于配置文件的`nodes`配置项中。您需要根据您要连接FISCO BCOS节点的实际配置修改该配置项的`ip`及`port`配置项，其中`ip`为所连节点的IP地址，`port`为所连节点的Channel通信端口（具体的值请参考节点目录下`config.ini`文件中的`channel_listen_port`配置项）。如果您使用了快速搭链，可以跳过此步。

配置完成后，即可开始使用CLI工具，CLI工具位于`packages/cli/cli.js`，所有操作均需要在`packages/cli/`目录下执行，您需要先切换至该目录：

```bash
cd packages/cli
```

### 2.3 开启命令自动补全

为方便用户使用，CLI工具支持在**bash**或**zsh**中进行子命令自动补全，此功能需要手动开启。启用方式为：

```bash
rcfile=~/.$(basename $SHELL)rc && ./cli.js completion >> $rcfile && source $rcfile
```

使用CLI工具时，可以在输入子命令或参数的过程中按下`Tab`键（依据系统配置的不同，可能需要连续按多次），便可弹出候选子命令或参数的列表，随后使用方向键进行选择即可，当候选子命令或参数唯一时，CLI工具会自动将该子命令或参数填充至对应的位置上。

### 2.4 使用示例

本节展示若干CLI工具的使用示例，供用户参考。

**请注意**：示例中的输出结果仅供参考，根据系统、节点版本等因素的不同，实际输出结果可能会有所出入。

#### 2.4.1 查看使用帮助

```bash
./cli.js --help
```

#### 2.4.2 查看CLI工具能够调用的命令及对应的功能

```bash
./cli.js list
```

#### 2.4.3 查看所连FISCO BCOS节点的版本

```bash
./cli.js getClientVersion
```

输出如下：

```JSON
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "Build Time": "20190705 21:19:13",
    "Build Type": "Linux/g++/RelWithDebInfo",
    "Chain Id": "1",
    "FISCO-BCOS Version": "2.0.0",
    "Git Branch": "master",
    "Git Commit Hash": "d8605a73e30148cfb9b63807fb85fa211d365014",
    "Supported Version": "2.0.0"
  }
}
```

#### 2.4.4 显示外部账户

假设在配置文件中有一个名为"alice"的账户。

```bash
./cli.js showAccount alice
```

输出如下：

```JSON
{
  "account": "0x144d5ca47de35194b019b6f11a56028b964585c9"
}
```

#### 2.4.5 获取当前的块高

```bash
./cli.js getBlockNumber
```

输出如下：

```JSON
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "1104"
}
```

#### 2.4.6 部署CLI工具自带的HelloWorld合约

HelloWorld合约位于`packages/cli/contracts/HelloWorld.sol`，若您需要部署自己合约，请先将您的合约拷贝至`packages/cli/contracts/`目录下。

```bash
./cli.js deploy HelloWorld
```

输出如下：

```JSON
{
  "status": "0x0",
  "contractAddress": "0x89f4c7ccb27f964ef9f8c78a8e583f2b8d619661",
  "transactionHash": "0xf8be7d6858d9886742ee3c1df5d80daf05c517808ce136db4012c00bbe71a945"
}
```

#### 2.4.7 调用HelloWorld合约的set接口

假设HelloWorld合约已在2.4.6节中部署。

```bash
./cli.js call HelloWorld 0x89f4c7ccb27f964ef9f8c78a8e583f2b8d619661 set vita
```

输出如下：

```JSON
{
  "transactionHash": "0x2fb634aa191298b15de3dff413163ebcd5b9f444fdb7d8eed88e78383f6842e9",
  "status": "0x0"
}
```

#### 2.4.8 调用HelloWorld合约的get接口

假设HelloWorld合约已在2.4.6节中部署。

```bash
./cli.js call HelloWorld 0x89f4c7ccb27f964ef9f8c78a8e583f2b8d619661 get
```

输出如下：

```JSON
{
  "status": "0x0",
  "output": {
    "function": "get()",
    "methodID": "0x6d4ce63c",
    "result": [
      "vita"
    ]
  }
}
```

其中，`output`中各字段的含义如下：

- `function`：所调用合约方法的签名
- `methodID`：所调用合约方法的选择器（selector）
- `result`：合约方法具体的返回值

#### 2.4.9 CRUD操作

CLI工具的`sql`子命令允许用户使用类SQL语法在链上进行CRUD操作，如下列示例所示：

- 创建表

    ```bash
    ./cli.js sql 'create table cli_demo(name varchar, item_id varchar, item_name varchar, primary key(name))'
    ```

    在上述示例中，创建了一个名为`cli_demo`的表，表中每条记录的主键名为`name`，另外还包括两个分别名为`item_id`和`item_name`的列，输出如下：

    ```JSON
    {
      "code": 0,
      "msg": "success"
    }
    ```

- 插入记录

    ```bash
    ./cli.js sql 'insert into cli_demo values ("fruit", "1", "apple2")'
    ```

    在上述示例中，向`cli_demo`表插入了一条记录，记录的`name`字段值为"fruit"，`item_id`字段值为"1"，`item_name`字段值为"apple2"，输出如下：

    ```JSON
    {
      "code": 0,
      "msg": "success",
      "affected": 1
    }
    ```

    其中，`affected`表示该操作所影响的表的行数。

- 查询记录

    ```bash
    ./cli.js sql 'select * from cli_demo where name = "fruit" and item_id = "1" limit 1 offset 1'
    ```

    在上述示例中，从`cli_demo`表中查询`name`字段值为"fruit"、`item_id`字段值为"1"的记录，输出如下：

    ```bash
    [ { name: 'fruit', item_id: '1', item_name: 'apple2' } ]
    ```

- 更新记录

    ```bash
    ./cli.js sql 'update cli_demo set item_name = "orange"  where name = "fruit"'
    ```

    在上述示例中，更新`cli_demo`表中、`name`字段值为"fruit"的记录，将这些记录的"item_name"字段值更新为"orange"，输出如下：

    ```JSON
    {
      "code": 0,
      "msg": "success",
      "affected": 1
    }
    ```

    其中，`affected`表示该操作所影响的表的行数。

- 删除记录

    ```bash
    # 删除在名为test的表中、主键的值为pineapple、num字段的值为4的记录
    ./cli.js sql 'delete from cli_demo where name = "fruit" and item_id = "1"'
    ```

    在上述示例中，将`cli_demo`中`name`字段值为"fruit"且`item_id`字段值为"1"的记录删除，输出如下：

    ```JSON
    {
      "code": 0,
      "msg": "success",
      "affected": 3
    }
    ```

    其中，`affected`表示该操作所影响的表的行数。

#### 2.4.10 更多CLI子命令使用帮助

如果您想知道某一个子命令该如何使用，可以使用如下格式的命令：

```bash
./cli.js <command> ?
```

其中command为一个子命令名，使用`?`作为参数便可获取该子命令的使用帮助，如：

```bash
./cli.js call ?
```

会得到如下的输出：

```text
cli.js call <contractName> <contractAddress> <function> [parameters...]

Call a contract by a function and parameters

位置：
  contractName     The name of a contract                        [字符串] [必需]
  contractAddress  20 Bytes - The address of a contract          [字符串] [必需]
  function         The function of a contract                    [字符串] [必需]
  parameters       The parameters(splited by space) of a function
                                                             [数组] [默认值: []]

选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]
```

## 三、API列表

### 3.1 API调用约定

- 调用Node.js SDK API前，首先需要初始化全局的`Configuration`对象，用以为各个服务提供必要的配置信息。`Configuration`对象位于可通过`require('packages/api').Configuration`的方式引入，随后调用`Configuration.setConfig(...)`函数即可完成`Configuration`对象初始化，`Configuration.setConfig(...)`函数的参数为配置文件的路径或一个符合`Configuration`格式要求的配置项对象。Node.js SDK所需的配置项请参阅『Node.js SDK配置项说明』一节；
- 如无特殊说明，Node.js SDK提供的API均为**异步**API。异步API的实际返回值是一个预期返回值的[Promise对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)，您可以使用[async/await语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)或[then...catch...finally方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)操作该Promise对象以实现自己的应用逻辑；
- 当API内部出现致命错误导致程序逻辑无法继续执行时（如合约地址不存在），均会直接抛出异常，所有异常均继承自Error类；
- 当您的应用配置为连接到多个节点时，Node.js SDK会将API产生的网络请求发往一个随机选中的节点。

### 3.2 Web3jService

**引用方式**：`require('packages/api').Web3jService`

**使用方式**：使用`new Web3jService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- getBlockNumber

    **功能**：获取当前块高  
    **参数**：无  
    **返回值**：`Object`，块高位于`result`字段中  

- getPbftView

  **功能**：获取当前PBFT视图  
  **参数**：无  
  **返回值**：`Object`，PBFT视图位于`result`字段中  

- getObserverList

  **功能**：获取当前观察者节点列表  
  **参数**：无  
  **返回值**：`Object`，观察者节点列表位于`result`字段中  

- getSealerList

  **功能**：获取当前共识节点列表  
  **参数**：无  
  **返回值**：`Object`，共识节点列表位于`result`字段中  

- getConsensusStatus

  **功能**：获取当前共识状态  
  **参数**：无  
  **返回值**：`Object`，共识状态位于`result`字段中  

- getSyncStatus

  **功能**：获取当前同步状态  
  **参数**：无  
  **返回值**：`Object`，同步状态位于`result`字段中  

- getClientVersion

  **功能**：获取节点版本信息  
  **参数**：无  
  **返回值**：`Object`，节点版本信息位于`result`字段中  

- getPeers

  **功能**：获取节点所连接的对等节点信息  
  **参数**：无  
  **返回值**：`Object`，对等节点信息位于`result`字段中  

- getNodeIDList

  **功能**： 获取节点及所连接对等节点的NodeID列表  
  **参数**：无  
  **返回值**：`Object`，NodeID列表位于`result`字段中  

- getGroupPeers

  **功能**：获取所属当前群组的共识节点及观察者节点的列表  
  **参数**：无  
  **返回值**：`Object`，节点列表位于`result`字段中  

- getGroupList

  **功能**：获取节点所属的群组列表  
  **参数**：无  
  **返回值**：`Object`，所属群组列表位于`result`字段中  

- getBlockByHash

  **功能**：根据指定的区块哈希获取相应的区块信息  
  **参数**：
  - `String`，blockHash。32字节长度的区块哈希
  - `Bool`，includeTransactions，可选，默认值为`false`。指示返回结果中是否需要包含交易的完整信息，若为`false`则返回结果中仅会包含交易哈希

  **返回值**：`Object`，区块信息位于`result`字段中  

- getBlockByNumber

  **功能**：根据指定的区块高度获取相应的区块信息  
  **参数**：
  - `String`，blockNumber。以字符串表示的非负区块高度
  - `Bool`，includeTransactions，可选，默认值为`false`。指示返回结果中是否需要包含交易的完整信息，若为`false`则返回结果中仅会包含交易哈希

  **返回值**：`Object`，区块信息位于`result`字段中  

- getBlockHashByNumber

  **功能**：根据指定的区块高度获取相应的区块哈希  
  **参数**：
  - `String`，blockNumber。以字符串表示的非负区块高度

  **返回值**：`Object`，区块哈希位于`result`字段中  

- getTransactionByHash

  **功能**：根据指定的交易哈希获取相应的交易信息  
  **参数**：
  - `String`，transactionHash。32字节长度的交易哈希

  **返回值**：`Object`，交易信息位于`result`字段中  

- getTransactionByBlockHashAndIndex

  **功能**：根据指定的区块哈希及交易索引获取相应的交易信息  
  **参数**：
  - `String`，blockHash。32字节长度的区块哈希
  - `String`，index。以字符串表示的非负交易索引

  **返回值**：`Object`，交易信息位于`result`字段中  

- getTransactionByBlockNumberAndIndex

  **功能**：根据指定的区块高度及交易索引获取相应的交易信息  
  **参数**：
  - `String`，blockNumber。以字符串表示的非负区块高度
  - `String`，index。以字符串表示的非负交易索引

  **返回值**：`Object`，交易信息位于`result`字段中  

- getPendingTransactions

  **功能**：获取当前滞留在节点交易池内还未上链的交易列表  
  **参数**：无  
  **返回值**：`Object`，滞留交易列表位于`result`字段中  

- getPendingTxSize

  **功能**：获取当前滞留在节点交易池内还未上链的交易数目  
  **参数**：无  
  **返回值**：`Object`，滞留交易数目位于`result`字段中  

- getTotalTransactionCount

  **功能**：获取当前已上链交易的总数  
  **参数**：无  
  **返回值**：`Object`，上链交易总数位于`result`字段中  

- getTransactionReceipt

  **功能**：根据交易哈希获取对应的交易回执  
  **参数**：
  - `String`，transactionHash。32字节长度的交易哈希

  **返回值**：`Object`，上链交易总数位于`result`字段中  

- getCode

  **功能**：根据合约地址获取对应的合约字节码  
  **参数**：
  - `String`，address。20字节长度的合约地址

  **返回值**：`Object`，合约字节码位于`result`字段中  

- getSystemConfigByKey

  **功能**：根据指定Key获取对应的系统配置信息  
  **参数**：
  - `String`，key。系统配置名

  **返回值**：`Object`，系统配置信息位于`result`字段中  

- sendRawTransaction

  **功能**：向节点发送交易  
  **参数**：

  *重载形式1：*
  - `String`，transaction。字符串表示的交易信息

  *重载形式2：*
  - `String`，to。20字节长度的目标合约地址
  - `String`，func。调用的合约方法名
  - `[Object]`，params。实参列表，若无则置为`[]`
  - `String`，who，可选。用于签署交易的账户名

  **返回值**：`Object`，交易哈希位于`transactionHash`字段中；交易执行状态位于`status`字段中；交易返回值位于`output`字段中

- deploy

  **功能**：根据ABI及字节码部署合约

  **参数**：

  - `Object`，abi。合约ABI
  - `String`，bin。合约字节码
  - `[Object]`，params。构造函数实参列表，若无则置为`[]`
  - `String`，who，可选。用于部署合约的账户名

  **返回值**：`Object`，交易哈希位于`transactionHash`字段中；合约部署状态位于`status`字段中；合约地址位于`contractAddress`字段中

- call

  **功能**：向节点发送只读请求（与交易不同，`call`只可用于调用合约的`pure`或`view`函数）

  **参数**：

  - `String`，to。20字节长度的目标合约地址
  - `String`，func。调用的合约方法名
  - `[Object]`，params。实参列表，若无则置为`[]`
  - `String`，who，可选。用于发送请求的账户名

  **返回值**：`Object`，请求状态码位于`code`字段中；返回值位于`output`字段中

### 3.3 PermissionService

**引用方式**：`require('packages/api').PermissionService`

**使用方式**：使用`new PermissionService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- grantUserTableManager

  **功能**：将指定外部账户加入至指定用户表的授权列表中

  **参数**：

  - `String`，tableName。用户表名
  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- revokeUserTableManager

  **功能**：将指定外部账户从指定用户表的授权列表中移出

  **参数**：

  - `String`，tableName。用户表名
  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- listUserTableManager

  **功能**：查询指定用户表的授权列表

  **参数**：

  - `String`，tableName。用户表名

  **返回值**：`[String]`，经过授权的外部账户列表

- grantDeployAndCreateManager

  **功能**：授予指定外部账户部署合约及创建用户表的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- revokeDeployAndCreateManager

  **功能**：取消指定外部账户部署合约及创建用户表的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- listDeployAndCreateManager

  **功能**：查询部署合约及创建用户表的授权列表

  **参数**：无

  **返回值**：`[String]`，经过授权的外部账户列表

- grantPermissionManager

  **功能**：授予指定外部账户管理权限的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- revokePermissionManager

  **功能**：取消指定外部账户管理权限的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- listPermissionManager

  **功能**：查询权限管理的授权列表

  **参数**：无

  **返回值**：`[String]`，经过授权的外部账户列表

- grantNodeManager

  **功能**：授予指定外部账户管理节点的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- revokeNodeManager

  **功能**：取消指定外部账户管理节点的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- listNodeManager

  **功能**：查询节点管理的授权列表

  **参数**：无

  **返回值**：`[String]`，经过授权的外部账户列表

- grantCNSManager

  **功能**：授予指定外部账户使用CNS服务的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- revokeCNSManager

  **功能**：取消指定外部账户使用CNS服务的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- listCNSManager

  **功能**：查询CNS服务的授权列表

  **参数**：无

  **返回值**：`[String]`，经过授权的外部账户列表

- grantSysConfigManager

  **功能**：授予指定外部账户设置系统配置的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- revokeSysConfigManager

  **功能**：取消指定外部账户设置系统配置的权限

  **参数**：

  - `String`，address。20字节长度的外部账户地址

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- listSysConfigManager

  **功能**：查询设置系统配置的授权列表

  **参数**：无

  **返回值**：`[String]`，经过授权的外部账户列表

### 3.4 CNSService

**引用方式**：`require('packages/api').CNSService`

**使用方式**：使用`new CNSService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- registerCns

  **功能**：根据合约名、合约版本号、合约地址和合约ABI注册CNS信息

  **参数**：
  
  - `String`，name。合约名
  - `String`，version。合约版本号
  - `String`，address。20字节长度的合约地址
  - `String`，abi。合约ABI

  **返回值**：`Number`，成功增加的CNS条目数

- getAddressByContractNameAndVersion

  **功能**：根据合约名及版本号（合约名及版本号用英文冒号连接）查询对应的合约地址。若缺失合约版本号，则默认返回最新版本的合约地址

  **参数**：
  
  - `String`，nameVersion。合约名及版本号（合约名及版本号用英文冒号连接）

  **返回值**：`Object`，合约地址信息

- queryCnsByName

  **功能**：根据合约名查询CNS信息

  **参数**：
  
  - `String`，合约名

  **返回值**：`[Object]`，对应合约的CNS信息列表

- queryCnsByNameAndVersion

  **功能**：根据合约名及版本号（合约名及版本号用英文冒号连接）查询CNS信息

  **参数**：
  
  - `String`，合约名及版本号（合约名及版本号用英文冒号连接）

  **返回值**：`Object`，对应版本号合约的CNS信息列表

### 3.5 SystemConfigService

**引用方式**：`require('packages/api').SystemConfigService`

**使用方式**：使用`new SystemConfigService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- setValueByKey

  **功能**：根据key设置对应系统配置的值

  **参数**：
  
  - `String`，key。系统配置的key
  - `String`，value。系统配置的值

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

### 3.6 ConsensusService

**引用方式**：`require('packages/api').ConsensusService`

**使用方式**：使用`new ConsensusService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- addSealer

  **功能**：将指定节点加入群组的共识节点列表

  **参数**：
  
  - `String`，nodeID。待加入群组共识节点列表的节点ID

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- addObserver

  **功能**：将指定节点加入群组的观察者节点列表

  **参数**：
  
  - `String`，nodeID。待加入群组观察者节点列表的节点ID

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- removeNode

  **功能**：将指定节点变更为游离节点

  **参数**：
  
  - `String`，nodeID。待成为游离节点的节点ID

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

### 3.6 CRUDService

**引用方式**：`require('packages/api').CRUDService`

**使用方式**：使用`new CRUDService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- createTable

  **功能**：创建用户表

  **参数**：
  
  - `Object`，table。表对象，表对象中需要设置表名、主键列名和其他列名，表对象的定义请参考`packages/api/precompiled/crud/table.js`。

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中

- insert

  **功能**：向用户表中插入记录

  **参数**：
  
  - `Object`，table。表对象，表对象中需要设置表名、主键列名和其他列名，表对象的定义请参考`packages/api/precompiled/crud/table.js`
  - `Object`，entry。记录对象，记录对象中需要设置各列的值，记录对象的定义请参考`packages/api/precompiled/crud/entry.js`

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中；若成功插入记录，则所影响的表的行数位于`affected`字段中

- update

  **功能**：更新用户表记录

  **参数**：
  
  - `Object`，table。表对象，表对象中需要设置表名、主键列名和其他列名，表对象的定义请参考`packages/api/precompiled/crud/table.js`
  - `Object`，entry。记录对象，记录对象中需要设置各列的值，记录对象的定义请参考`packages/api/precompiled/crud/entry.js`
  - `Object`，condition。条件对象，条件对象中需要设置过滤记录的谓词，条件对象的定义请参考`packages/api/precompiled/crud/condition.js`

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中；若成功更新记录，则所影响的表的行数位于`affected`字段中

- remove

  **功能**：删除用户表记录

  **参数**：
  
  - `Object`，table。表对象，表对象中需要设置表名、主键列名和其他列名，表对象的定义请参考`packages/api/precompiled/crud/table.js`
  - `Object`，condition。条件对象，条件对象中需要设置过滤记录的谓词，条件对象的定义请参考`packages/api/precompiled/crud/condition.js`

  **返回值**：`Object`，请求状态码位于`code`字段中；状态码对应的可读信息位于`message`字段中；若成功删除记录，则所影响的表的行数位于`affected`字段中

- desc

  **功能**：查询用户表元信息

  **参数**：
  
  - `String`，tableName。用户表名

  **返回值**：`Object`，表对象，包含了表名、主键列名、其他列名等用户表元信息，表对象的定义请参考`packages/api/precompiled/crud/table.js`

### 3.7 compile

**引用方式**：`require('packages/api').compile`

**使用方式**：直接作为函数进行调用

**功能**：编译合约

**参数**：

- `String`，contractPath。合约地址
- `String`，solc，可选。若用户需要使用自定义的Solidity编译器，请将该参数设置为调用自定义Solidity编译器的命令名。

**返回值**：`Object`，`ContractClass`对象，其具体功能请参考3.8节

### 3.8 ContractClass

**引用方式**：无

**使用方式**：通过`compile` API生成该类型的对象实例，随后调用对象实例上的成员方法

**成员方法**：

- newInstance：

  **功能**：生成合约对象

  **参数**：无

  **返回值**：`Object`，合约对象，其具体功能请参考3.9节

### 3.8 合约对象

**引用方式**：无

**使用方式**：通过`ContractClass`对象实例的`newInstance`方法生成该类型的对象实例，随后调用对象实例上的成员方法

**成员方法**：

- $deploy

  **功能**：部署用户合约

  **参数**：
  
  - `Object`，web3j。有效的Web3jService对象实例
  - `[Object]`, params。用户合约中构造函数参数列表所对应的实参

  **返回值**：`String`，20字节长度的合约地址

- $getAddress

  **功能**：获取用户合约地址

  **参数**：无

  **返回值**：用户部署合约后的合约地址

- $getEventABIOf

  **功能**：获取指定合约事件的ABI

  **参数**：

  - `String`，name。事件名

  **返回值**：指定合约事件的ABI

- 动态函数簇

  **说明**：合约对象实例会根据用户合约中的方法动态生成相同名字及参数的函数，以[HelloWorld合约](https://github.com/FISCO-BCOS/nodejs-sdk/blob/master/packages/cli/contracts/HelloWorld.sol)为例，HelloWorld合约中存在`get`及`set`两个合约方法，则合约对象实例会自动生成同名且同参数的`get`及`set`函数，用户可在应用中直接调用合约对象实例提供的`get`或`set`函数即可调用已部署HelloWorld合约的`get`或`set`方法，而无需调用Web3jService提供的`sendRawTransaction`及`call` API。动态函数簇的存在可极大简化应用开发，以下代码片段展示了如何使用动态函数簇调用HelloWorld合约：

  ```javascript
  // contractPath为HelloWorld合约的路径
  let contractClass = compile(contractPath);
  let helloWorld = contractClass.newInstance();

  await helloWorld.$deploy(web3j);
  await helloWorld.set('こんにちわ！');
  let ret = await helloWorld.get();
  should.equal(ret[0], 'こんにちわ！');
  ```

### 3.9 EventLogService

**引用方式**：`require('packages/api').EventLogService`

**使用方式**：使用`new EventLogService()`进行实例化，随后调用对象实例上的成员方法

**成员方法**：

- registerEventLogFilter

  **功能**：注册事件过滤器及回调函数

  **参数**：

  - `String`，from。字符串表示的初始区块高度，使用"latest"表示当前块高
  - `String`，to。字符串表示的最终区块高度，使用"latest"表示处当前块高。当处理至当前块高时，继续等待新区块
  - `[String]`，addresses。需要监听的合约地址数组，可为空
  - `[String]`，topics。需要监听的topic数组，可为空
  - `Function`，callback。事件发生的调用的回调函数，调用回调参数时会传递两个参数：状态及日志列表
  - `Object`，abi，可选。当需要对日志进行解码时，可传入事件的ABI或整个合约的ABI

  **返回值**：`Object`，注册请求状态码位于`result`字段中；事件过滤器ID位于`filterID`字段中

- unregisterEventLogFilter

  **功能**：取消已注册的事件过滤器及回调函数，**此API为同步API**

  **参数**：

  - `String`，filterID。事件过滤器ID

  **返回值**：无

## 四、Node.js SDK配置项说明

配置项中各字段的说明如下：

- `encryptType`: `String`，必需。指定交易签名、合约部署时所使用的加密算法。`ECDSA`表示使用ECDSA(secp256k1)加密算法，`SM_CRYPTO`表示使用国密算法。
- `accounts`：`Object`，必需。用户集合，每个用户均由私钥及用于索引该私钥用户名组成。私钥可以为一个256 bits的随机整数，也可以是一个pem或p12格式的私钥文件，后两者需要结合[get_account.sh](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/manual/account.html)或[get_gm_account.sh](https://raw.githubusercontent.com/FISCO-BCOS/console/master/tools/get_gm_account.sh)生成的私钥文件使用。私钥包含两个必需字段，一个可选字段：
  - `type`: `String`，必需。用于指示私钥类型。`type`的值必需为下列三个值之一：
    - `ecrandom`：随机整数
    - `pem`：pem格式的文件
    - `p12`：p12格式的文件
  - `value`：`String`，必需。用于指示私钥具体的值：
    - 如果`type`为`ecrandom`，则`value`为一个长度为256 bits 的随机整数，其值介于1 ~ 0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFE BAAE DCE6 AF48 A03B BFD2 5E8C D036 4141之间。
    - 如果`type`为`pem`，则`value`为pem文件的路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
    - 如果`type`为`p12`，则`value`为p12文件的路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
  - `password`：`String`，可选。如果`type`为`p12`，则需要此字段以解密私钥，否则会忽略该字段。
- `nodes`: `[Object]`，必需。FISCO BCOS节点列表，CLI工具在使用时会从该列表中随机挑选一个节点进行通信，要求节点数目必须 >= 1。每个节点包含两个字段：
  - `ip`: `String`，必需。FISCO BCOS节点的IP地址
  - `port`: `String`，必需，FISCO BCOS节点的Channel端口
- `authentication`：`Object`。必需，包含建立Channel通信时所需的认证信息，一般在建链过程中自动生成。`authentication`包含三个必需字段：
  - `key`: `String`，必需。私钥文件路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
  - `cert`: `String`，必需。证书文件路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
  - `ca`: `String`，必需。CA根证书文件路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
- `groupID`: `Number`。CLI所操作的链的群组ID
- `timeout`: `Number`。CLI工具所连节点可能会陷入停止响应的状态。为避免陷入无限等待，CLI工具的每一项操作在`timeout`之后若仍没有得到结果，则强制退出。`timeout`的单位为毫秒。
- `solc`: `String`，可选。Node.js SDK已经自带0.4.26及0.5.10版本的Solidity编译器，如果您有特殊的编译器需求，可以设置本配置项为您的编译器的执行路径或全局命令。

## 五、贡献代码

- 我们欢迎并非常感谢您的贡献，请参阅[代码贡献流程](https://mp.weixin.qq.com/s/hEn2rxqnqp0dF6OKH6Ua-A)。
- 如项目对您有帮助，欢迎star支持！
- 诚挚感谢以下开发人员对Node.js SDK项目的宝贵贡献（排名不分先后），开源社区因为有你们而更加精彩：
  - ***leayingly***
    - 个人主页：[https://github.com/leayingly](https://github.com/leayingly)
    - 贡献：Node.js多个重要feature（事件回调、多用户加载等）的推动者，修复CLI工具调用合约时不能处理合约方法重载的bug、编译0.5版本合约时不能正确处理编译器报错的bug
  - ***rexsea***
    - 个人主页：[https://github.com/rexsea](https://github.com/rexsea)
    - 贡献：修复CRUDService中存在变量重复定义的bug
  - ***wangxingaoyan***
    - 个人主页：[https://github.com/wangxingaoyan](https://github.com/wangxingaoyan)
    - 贡献：改进了部分代码文件的代码风格
  - ***yangshu502***
    - 个人主页：[https://github.com/yangshu502](https://github.com/yangshu502)
    - 贡献：规范了Node.js SDK部分配置项的格式

## 六、加入我们的社区

**FISCO BCOS开源社区**是国内活跃的开源社区，社区长期为机构和个人开发者提供各类支持与帮助。已有来自各行业的数千名技术爱好者在研究和使用FISCO BCOS。如您对FISCO BCOS开源技术及应用感兴趣，欢迎加入社区获得更多支持与帮助。

![qr_image](https://raw.githubusercontent.com/FISCO-BCOS/LargeFiles/master/images/QR_image.png)

## 七、License

Node.js SDK的开源协议为[APACHE LICENSE, VERSION 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)，详情请参考[LICENSE](./LICENSE)。
