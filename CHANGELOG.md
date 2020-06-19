### v1.0.0

(2020-06-19)

**新增**

- SDK新增国密模式，应用可连接至国密FISCO BCOS节点
- SDK新增编译、部署、调用0.4.24及0.5.1版本国密Solidity合约的API
- SDK新增合约事件推送相关的API
- SDK新增多用户管理特性，用户可在配置文件中配置多个账户，并在调用账户相关API时灵活指定要使用的账户
- SDK新增动态函数特性，可根据用户合约中定义的方法动态生成可被直接调用的同名、同参数的Node.js函数，提升用户应用开发体验
- CLI工具新增sql子命令，支持使用SQL语法操作CRUD
- CLI工具新增getCode子命令
- 支持通过npm install直接部署SDK，简化用户操作

**更新**

- Node.js最低版本要求修改为10，以支持Promise.finally()语法
- 编解码模块全面支持ABIEncoderV2，支持编、解码数组或结构体类型的合约方法参数及返回值
- 解码模块支持解码合约中require语句异常时返回的Error Message
- 优化了CLI工具的结果展示方式，结果展示更为统一且更易阅读
- 去除了全局配置，方便应用灵活加载配置

**修复**

- 修复当合约包含库（Library）引用时，合约部署失败的问题
- 修复网络异常时应用无法重连的问题
- 修复了CRUDService中变量重定义的问题

**兼容性**

部分API与v0.9.0不兼容，请注意适配。不兼容的API包括：

- 废弃了Configuration类的全局单例模式，应用在实例化Service类实例时需要主动提供Configuration对象实例
- compile由全局函数改为CompileService类的成员函数，并允许用户传入库链接参数

### v0.9.0

(2019-08-16)

**新增**

- 提供调用FISCO BCOS [JSON-RPC](https://fisco-bcos-documentation.readthedocs.io/zh_CN/latest/docs/api.html)的Node.js API
- 提供部署及调用Solidity合约（支持Solidity 0.4.x 及Solidity 0.5.x）的Node.js API
- 提供调用预编译（Precompiled）合约的Node.js API
- 使用[Channel协议](https://fisco-bcos-documentation.readthedocs.io/zh_CN/release-2.0/docs/design/protocol_description.html#channelmessage)与FISCO BCOS节点通信，双向认证更安全
- 提供CLI（Command-Line Interface）工具供用户在命令行中方便快捷地调用管理区块链的Node.js API
- 支持Windows、Linux及MacOS操作系统