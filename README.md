
![](https://github.com/FISCO-BCOS/FISCO-BCOS/raw/master/docs/images/FISCO_BCOS_Logo.svg?sanitize=true)

[![Build Status](https://travis-ci.org/FISCO-BCOS/nodejs-sdk.svg?branch=master)](https://travis-ci.org/FISCO-BCOS/nodejs-sdk)
[![GitHub license](https://img.shields.io/badge/%20license-Apache%202.0-green)](https://github.com/FISCO-BCOS/nodejs-sdk/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/FISCO-BCOS/nodejs-sdk.svg)](https://github.com/FISCO-BCOS/nodejs-sdk/issues)
--- 

Node.js SDK为[FISCO BCOS](https://github.com/FISCO-BCOS/FISCO-BCOS/tree/master)提供Node.js API，使用FISCO BCOS Node.js SDK可以简单快捷地基于FISCO-BCOS进行区块链应用开发。**此版本只支持**[FISCO BCOS v2.0.0](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/)及以上。


## 关键特性

- 提供调用FISCO BCOS [JSON-RPC](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/api.html)的Node.js API
- 提供部署及调用Solidity合约（支持Solidity 0.4.x 及Solidity 0.5.x）的Node.js API
- 提供调用预编译（Precompiled）合约的Node.js API
- 使用[Channel协议](https://fisco-bcos-documentation.readthedocs.io/zh_CN/release-2.0/docs/design/protocol_description.html#channelmessage)与FISCO BCOS节点通信，双向认证更安全
- 提供CLI（Command-Line Interface）工具供用户在命令行中方便快捷地调用管理区块链的Node.js API
- 支持Windows、Linux及MacOS操作系统

## 部署Node.js SDK

### 环境要求

- Node.js开发环境
  - Node.js >= 8.10.0
  - npm >= 5.6.0
  
  如果您没有部署过Node.js环境，可以参考下列部署方式：
  - 如果您使用Linux或MacOS：

    推荐使用[nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)快速部署，使用nvm同时也能够避免潜在的导致Node.js SDK部署失败的权限问题。以部署Node.js 8为例，部署步骤如下：

      ```bash
      # 安装nvm
      curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
      # 加载nvm配置
      source ~/.$(basename $SHELL)rc
      # 安装Node.js 8
      nvm install 8
      # 使用Node.js 8
      nvm use 8
      ```

  - 如果您使用Windows：

    请前往[Node.js官网](https://nodejs.org/en/download/)下载Windows下的安装包进行安装。

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

  该命令可能会下载约1GB的依赖项，整个过程可能会持续数十分钟，请耐心等待。

  **请注意，如果您使用Windows，则如无特殊说明，本文之后所提到的命令均需要在Git bash中执行**

- FISCO BCOS节点：请参考[FISCO BCOS安装](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/installation.html#fisco-bcos)搭建

### 拉取源代码

```bash
git clone https://github.com/FISCO-BCOS/nodejs-sdk.git
```

### 部署

<table><tr><td bgcolor=gray>

*如果您的网络中使用了代理，请先为npm配置代理。如果没有使用代理，请忽略。*

```bash
npm config set proxy <your proxy>
npm config set https-proxy <your proxy>
```

*如果您所使用的网络不能顺利访问npm官方镜像，请使用其他镜像代替，如淘宝：*

```bash
npm config set registry https://registry.npm.taobao.org
```

</td></tr></table>

```bash
# 部署过程中请确保能够访问外网以能够安装第三方依赖包
cd nodejs-sdk
npm install
npm run repoclean
npm run bootstrap
```

## 使用CLI工具

Node.js SDK自带一个CLI工具供用户在命令行中方便快捷地调用管理区块链的Node.js API，同时CLI工具也能够方便地被应用到脚本中。CLI工具在Node.js SDK提供的API的基础上开发而成，是一个展示如何使用Node.js API进行二次开发的范例。

### 快速建链（可选）

若您的系统中已经搭建了FISCO BCOS链，请跳过本节。

```bash
# 获取建链脚本
curl -LO https://github.com/FISCO-BCOS/FISCO-BCOS/releases/download/`curl -s https://api.github.com/repos/FISCO-BCOS/FISCO-BCOS/releases | grep "\"v2\.[0-9]\.[0-9]\"" | sort -u | tail -n 1 | cut -d \" -f 4`/build_chain.sh && chmod u+x build_chain.sh
# 在本地建一个4节点的FISCO BCOS链
bash build_chain.sh -l "127.0.0.1:4" -p 30300,20200,8545 -i
# 启动FISCO BCOS链
bash nodes/127.0.0.1/start_all.sh
```

**配置证书、节点IP及Channel端口**

- 配置证书

    修改配置文件，证书配置位于`packages/cli/conf/config.json`文件的`authentication`配置项中。你需要根据您实际使用的证书文件的路径修改该配置项的`key`、`cert`及`ca`配置，其中`key`为SDK私钥文件的路径，`cert`为SDK证书文件的路径，`ca`为链根证书文件的路径，这些文件可以由[建链脚本](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/manual/build_chain.html)或[企业级部署工具](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/enterprise_tools/index.html)自动生成，具体的生成方式及文件位置请参阅上述工具的说明文档。

- 配置节点IP及Channel端口

    修改配置文件，节点IP及端口配置位于`packages/cli/conf/config.json`文件的`nodes`配置项中。您需要根据您要连接FISCO BCOS节点的实际配置修改该配置项的`ip`及`port`配置，其中`ip`为所连节点的IP地址，`port`为节点目录下的 config.ini 文件中的`channel_listen_port`配置项的值。如果您使用了快速搭链，可以跳过此步。

配置完成后，即可开始使用CLI工具，CLI工具位于`packages/cli/cli.js`，所有操作均需要在`packages/cli/`目录下执行，您需要先切换至该目录：

```
cd packages/cli
```

### 开启自动补全（仅针对bash及zsh用户，可选）

为方便用户使用CLI工具，CLI工具支持在bash或zsh中进行自动补全，此功能需要手动启用，执行命令：

```bash
rcfile=~/.$(basename $SHELL)rc && ./cli.js completion >> $rcfile && source $rcfile
```

便可启用自动补全。使用CLI工具时，按下`Tab`键（依据系统配置的不同，可能需要按两下）便可弹出候选命令或参数的列表并自动补全。

### 使用示例

以下给出几个使用示例：

#### 查看CLI工具的帮助

```bash
./cli.js --help
```

#### 查看CLI工具能够调用的命令及对应的功能

```bash
./cli.js list
```

*以下示例中的输入、输出及参数仅供举例*

#### 查看所连的FISCO BCOS节点版本

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

#### 显示外部账户

```bash
./cli.js showAccount
```

输出如下：

```JSON
{
  "account": "0x144d5ca47de35194b019b6f11a56028b964585c9"
}
```

#### 获取当前的块高

```bash
./cli.js getBlockNumber
```

输出如下：

```JSON
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "0xfa"
}
```

#### 部署SDK自带的HelloWorld合约

```bash
./cli.js deploy HelloWorld
```

输出如下：

```JSON
{
  "contractAddress": "0x940b13378a8908ddd4d10a565c1feb22036c4c9e",
  "status": "0x0"
}
```

#### 调用HelloWorld合约的set接口，请将合约地址改为实际地址

```bash
./cli.js call HelloWorld 0x940b13378a8908ddd4d10a565c1feb22036c4c9e set vita
```

输出如下：

```JSON
{
  "transactionHash": "0x1e535cda124ef4c1fd3f92cae275b9adf7eaa5aff3fdf265d2fe397a6c920057",
  "status": "0x0"
}
```

#### 调用HelloWorld合约的get接口，请将合约地址改为实际地址

```bash
./cli.js call HelloWorld 0x940b13378a8908ddd4d10a565c1feb22036c4c9e get
```

输出如下：

```JSON
{
  "status": "0x0",
  "output": {
    "0": "vita"
  }
}
```

#### 通过CRUD接口创建表

```bash
# 创建一个名为test的表，每条记录的主键名为fruit，另外还包括两个分别名为num和purpose的字段
./cli.js create test fruit num,purpose
```

输出如下：

```bash
# 返回状态码，0表示创建成功
0
```

#### 通过CRUD接口插入记录

```bash
# 向名为test的表中插入一条记录，该记录的主键的值为pineapple，num字段的值为4，purpose字段的值为pie
./cli.js insert test pineapple 4,pie
```

输出如下：

```bash
# 返回成功插入的记录数
1
```

#### 通过CRUD接口查询记录

```bash
# 从名为test的表中选出主键的值为pineapple、purpose字段的值为pie的记录
./cli.js select test pineapple purpose=pie
```

```bash
# 返回记录列表
[ { fruit: 'pineapple', num: '4', purpose: 'pie' } ]
```

#### 通过CRUD接口更新记录

```bash
# 更新在名为test的表中、主键的值为pineapple、purpose字段的值为pie的记录，将num和purpose字段的值分别更新为4和hot pie
./cli.js update test pineapple "4,hot pie" purpose=pie
```

输出如下：

```bash
# 返回成功更新的记录数
1
```

#### 通过CRUD接口删除记录

```bash
# 删除在名为test的表中、主键的值为pineapple、num字段的值为4的记录
./cli.js remove test pineapple num=4
```

输出如下：

```bash
# 返回成功删除的记录数
1
```

#### CLI帮助

如果您想知道某一个命令该如何使用，可以使用如下的命令：

```bash
./cli.js <command> ?
```

其中command为一个命令名，使用`?`作为参数便可获取该命令的使用提示，如：

```bash
./cli.js call ?
```

会得到如下的输出：

```bash
cli.js call <contractName> <contractAddress> <function> [parameters...]

Call a contract by a function and parameters

位置：
  contractName     The name of a contract                        [字符串] [必需]
  contractAddress  20 Bytes - The address of a contract          [字符串] [必需]
  function         The function of a contract                    [字符串] [必需]
  parameters       The parameters(splited by a space) of a function
                                                             [数组] [默认值: []]

选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]
```

## CLI工具配置项说明

CLI工具的配置文件位于`nodejs-sdk/packages/cli/conf/config.json`，配置文件中各字段的说明如下：

- `privateKey`: `object`，必需。外部账户的私钥，可以为一个256 bits的随机整数，也可以是一个pem或p12格式的私钥文件，后两者需要结合[get_account.sh](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/manual/account.html)生成的私钥文件使用。`privateKey`包含两个必需字段，一个可选字段：
  - `type`: `string`，必需。用于指示私钥类型。`type`的值必需为下列三个值之一：
    - `ecrandom`：随机整数
    - `pem`：pem格式的文件
    - `p12`：p12格式的文件
  - `value`：`string`，必需。用于指示私钥具体的值：
    - 如果`type`为`ecrandom`，则`value`为一个长度为256 bits 的随机整数，其值介于1 ~ 0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFE BAAE DCE6 AF48 A03B BFD2 5E8C D036 4141之间。
    - 如果`type`为`pem`，则`value`为pem文件的路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
    - 如果`type`为`p12`，则`value`为p12文件的路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
  - `password`：`string`，可选。如果`type`为`p12`，则需要此字段以解密私钥，否则会忽略该字段。
- `nodes`: `list`，必需。FISCO BCOS节点列表，CLI工具在使用时会从该列表中随机挑选一个节点进行通信，要求节点数目必须 >= 1。每个节点包含两个字段：
  - `ip`: `string`，必需。FISCO BCOS节点的IP地址
  - `port`: `string`，必需，FISCO BCOS节点的Channel端口
- `authentication`：`object`。必需，包含建立Channel通信时所需的认证信息，一般在建链过程中自动生成。`authentication`包含三个必需字段：
  - `key`: `string`，必需。私钥文件路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
  - `cert`: `string`，必需。证书文件路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
  - `ca`: `string`，必需。CA根证书文件路径，如果是相对路径，需要以配置文件所在的目录为相对路径起始位置。
- `groupID`: `number`。CLI所操作的链的群组ID
- `timeout`: `number`。CLI工具所连节点可能会陷入停止响应的状态。为避免陷入无限等待，CLI工具的每一项操作在`timeout`之后若仍没有得到结果，则强制退出。`timeout`的单位为毫秒。
- `solc`: `string`，可选。Node.js SDK已经自带0.4.26及0.5.10版本的Solidity编译器，如果您有特殊的编译器需求，可以设置本配置项为您的编译器的执行路径或全局命令。

## 贡献代码

- 我们欢迎并非常感谢您的贡献，请参阅[代码贡献流程](https://mp.weixin.qq.com/s/hEn2rxqnqp0dF6OKH6Ua-A
)和[代码规范](../CODING_STYLE.md)。
- 如项目对您有帮助，欢迎star支持！

## 加入我们的社区

**FISCO BCOS开源社区**是国内活跃的开源社区，社区长期为机构和个人开发者提供各类支持与帮助。已有来自各行业的数千名技术爱好者在研究和使用FISCO BCOS。如您对FISCO BCOS开源技术及应用感兴趣，欢迎加入社区获得更多支持与帮助。

![](https://media.githubusercontent.com/media/FISCO-BCOS/LargeFiles/master/images/QR_image.png)

## License
![license](https://img.shields.io/badge/%20license-Apache%202.0-green)

Node.js SDK的开源协议为[APACHE LICENSE, VERSION 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)，详情参考[LICENSE](./LICENSE)。
