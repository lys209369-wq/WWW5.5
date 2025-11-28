# Cocreate 智能合约

这是 Cocreate 项目的智能合约层，使用 Foundry 开发框架。

## 📋 目录

- [合约架构](#合约架构)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [测试](#测试)
- [部署](#部署)

---

## 合约架构

```
contracts/src/
├── ProjectFactory.sol      # 项目工厂合约（核心协调）
├── StakeVault.sol         # 质押金库合约（资金管理）
├── TaskManager.sol        # 任务管理合约（任务流程）
├── ContributionNFT.sol    # 贡献 NFT 合约（SBT）
├── interfaces/            # 合约接口
│   ├── IProjectFactory.sol
│   ├── IStakeVault.sol
│   ├── ITaskManager.sol
│   └── IContributionNFT.sol
└── libraries/             # 共享库
    ├── DataTypes.sol      # 数据结构定义
    ├── Events.sol         # 事件定义
    └── Errors.sol         # 错误定义
```

### 核心合约

1. **ProjectFactory** - 项目管理
   - 创建项目
   - 成员加入/退出
   - 项目结算

2. **StakeVault** - 资金管理
   - 质押存入/锁定
   - 质押释放（Pull Pattern）
   - 质押罚没

3. **TaskManager** - 任务流程
   - 任务创建
   - 证明提交
   - 任务审核

4. **ContributionNFT** - 贡献证明
   - SBT（Soulbound Token）
   - 不可转让的贡献记录

---

## 快速开始

### 安装 Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 安装依赖

```bash
cd contracts
forge install
```

### 编译合约

```bash
forge build
```

### 运行测试

```bash
forge test
```

---

## 开发指南

### 环境配置

复制 `.env.example` 为 `.env` 并填入实际值：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 本地开发

启动本地节点：

```bash
anvil
```

在另一个终端部署合约：

```bash
forge script script/Deploy.s.sol --rpc-url localhost --broadcast
```

---

## 测试

### 运行所有测试

```bash
forge test
```

### 运行特定测试

```bash
forge test --match-contract ProjectFactoryTest
forge test --match-test testCreateProject
```

### 查看测试覆盖率

```bash
forge coverage
```

### Gas 报告

```bash
forge test --gas-report
```

---

## 部署

### 测试网部署（Sepolia）

```bash
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### 主网部署

⚠️ **请先在测试网充分测试！**

```bash
forge script script/Deploy.s.sol \
  --rpc-url $MAINNET_RPC_URL \
  --broadcast \
  --verify
```

详细部署文档请参考根目录的 [DEPLOYMENT.md](../DEPLOYMENT.md)。

---

## 合约交互

### 使用 cast 命令

创建项目：

```bash
cast send <PROJECT_FACTORY_ADDRESS> \
  "createProject(string,string,uint96)" \
  "Test Project" \
  "ipfs://QmTest..." \
  1000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

查询项目信息：

```bash
cast call <PROJECT_FACTORY_ADDRESS> \
  "getProject(uint256)" \
  1 \
  --rpc-url $SEPOLIA_RPC_URL
```

---

## 安全特性

- ✅ **ReentrancyGuard**: 防止重入攻击
- ✅ **Pausable**: 紧急暂停功能
- ✅ **AccessControl**: 细粒度权限管理
- ✅ **Pull Payment**: 安全的资金提取模式
- ✅ **Soulbound NFT**: 不可转让的贡献证明

---

## 相关资源

- [Foundry 文档](https://book.getfoundry.sh/)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts/)
- [Solidity 文档](https://docs.soliditylang.org/)

---

## 许可证

MIT
