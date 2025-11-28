# Cocreate 智能合约部署指南

## 📋 目录

- [部署前准备](#部署前准备)
- [本地部署（Anvil）](#本地部署anvil)
- [测试网部署（Sepolia）](#测试网部署sepolia)
- [主网部署](#主网部署)
- [部署验证](#部署验证)
- [合约交互](#合约交互)

---

## 部署前准备

### 1. 安装依赖

确保已安装 Foundry：

```bash
# 安装 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入实际值：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 部署者私钥（必填）
PRIVATE_KEY=your_private_key_here

# 合约所有者地址（可选，默认使用部署者地址）
OWNER_ADDRESS=0x...

# RPC 端点
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key

# Etherscan API Key（用于合约验证）
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 编译合约

```bash
forge build
```

确保所有合约编译成功，没有错误。

---

## 本地部署（Anvil）

### 1. 启动本地节点

在一个终端窗口中：

```bash
anvil
```

这将启动一个本地以太坊节点，监听 `http://127.0.0.1:8545`。

### 2. 部署合约

在另一个终端窗口中：

```bash
# 加载环境变量
source .env

# 部署到本地网络
forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  -vvvv
```

### 3. 查看部署结果

部署成功后，合约地址会保存在 `deployments/31337.md`（31337 是 Anvil 的 chain ID）。

---

## 测试网部署（Sepolia）

### 1. 准备测试 ETH

从水龙头获取 Sepolia 测试 ETH：
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### 2. 部署到 Sepolia

```bash
# 加载环境变量
source .env

# 部署到 Sepolia 测试网
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

参数说明：
- `--broadcast`: 实际发送交易
- `--verify`: 在 Etherscan 上验证合约
- `-vvvv`: 详细日志输出

### 3. 查看部署结果

- 部署地址保存在 `deployments/11155111.md`（11155111 是 Sepolia 的 chain ID）
- 在 Etherscan 上查看：https://sepolia.etherscan.io/

---

## 主网部署

⚠️ **警告：主网部署需要真实 ETH，请谨慎操作！**

### 1. 最终检查清单

- [ ] 所有合约已在测试网测试通过
- [ ] 已进行完整的安全审计
- [ ] 准备了足够的 ETH（建议 0.5-1 ETH 用于 Gas）
- [ ] 已备份私钥和助记词
- [ ] 确认 `OWNER_ADDRESS` 设置正确

### 2. 部署到主网

```bash
# 加载环境变量
source .env

# 部署到以太坊主网
forge script script/Deploy.s.sol \
  --rpc-url $MAINNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 3. 记录部署信息

- 部署地址保存在 `deployments/1.md`
- **立即备份所有部署地址和交易哈希**
- 在 Etherscan 上验证合约：https://etherscan.io/

---

## 部署验证

### 1. 验证合约状态

部署完成后，验证合约配置：

```bash
# 检查 StakeVault 配置
cast call <STAKE_VAULT_ADDRESS> "projectFactory()" --rpc-url $SEPOLIA_RPC_URL
cast call <STAKE_VAULT_ADDRESS> "taskManager()" --rpc-url $SEPOLIA_RPC_URL

# 检查 ProjectFactory 配置
cast call <PROJECT_FACTORY_ADDRESS> "STAKE_VAULT()" --rpc-url $SEPOLIA_RPC_URL
cast call <PROJECT_FACTORY_ADDRESS> "TASK_MANAGER()" --rpc-url $SEPOLIA_RPC_URL

# 检查 TaskManager 配置
cast call <TASK_MANAGER_ADDRESS> "PROJECT_FACTORY()" --rpc-url $SEPOLIA_RPC_URL
cast call <TASK_MANAGER_ADDRESS> "STAKE_VAULT()" --rpc-url $SEPOLIA_RPC_URL
cast call <TASK_MANAGER_ADDRESS> "CONTRIBUTION_NFT()" --rpc-url $SEPOLIA_RPC_URL

# 检查 ContributionNFT 配置
cast call <CONTRIBUTION_NFT_ADDRESS> "name()" --rpc-url $SEPOLIA_RPC_URL
cast call <CONTRIBUTION_NFT_ADDRESS> "symbol()" --rpc-url $SEPOLIA_RPC_URL
cast call <CONTRIBUTION_NFT_ADDRESS> "isSoulbound()" --rpc-url $SEPOLIA_RPC_URL
```

### 2. 验证权限配置

```bash
# 检查 ContributionNFT 的 MINTER_ROLE
cast call <CONTRIBUTION_NFT_ADDRESS> \
  "hasRole(bytes32,address)" \
  $(cast keccak "MINTER_ROLE") \
  <TASK_MANAGER_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL
```

---

## 合约交互

### 创建项目

```bash
cast send <PROJECT_FACTORY_ADDRESS> \
  "createProject(string,string,uint96)" \
  "Test Project" \
  "ipfs://QmTest..." \
  1000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

### 加入项目

```bash
cast send <PROJECT_FACTORY_ADDRESS> \
  "joinProject(uint256)" \
  1 \
  --value 0.001ether \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

### 创建任务

```bash
cast send <TASK_MANAGER_ADDRESS> \
  "createTask(uint256,address,string,string)" \
  1 \
  <ASSIGNEE_ADDRESS> \
  "Task Title" \
  "ipfs://QmTask..." \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

### 提交任务证明

```bash
cast send <TASK_MANAGER_ADDRESS> \
  "submitProof(uint256,string)" \
  1 \
  "ipfs://QmProof..." \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

### 审核任务

```bash
# 批准任务
cast send <TASK_MANAGER_ADDRESS> \
  "reviewTask(uint256,bool)" \
  1 \
  true \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

---

## 部署架构

```
┌─────────────────────────────────────────────────────┐
│                  部署流程                            │
└─────────────────────────────────────────────────────┘

Step 1: StakeVault
  └─> 独立部署

Step 2: TaskManager (临时配置)
  └─> 使用零地址占位符

Step 3: ContributionNFT
  └─> TaskManager 作为 minter

Step 4: ProjectFactory
  └─> 连接 StakeVault 和 TaskManager

Step 5: 配置权限
  ├─> StakeVault.setProjectFactory()
  ├─> StakeVault.setTaskManager()
  └─> TaskManager.setProjectFactory()
```

---

## 合约地址记录

部署后，合约地址会自动保存在 `deployments/<chain_id>.md`：

- **31337**: Anvil 本地网络
- **11155111**: Sepolia 测试网
- **1**: Ethereum 主网

---

## 故障排查

### 问题：Gas 估算失败

**解决方案**：
```bash
# 增加 Gas limit
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --gas-limit 10000000
```

### 问题：验证失败

**解决方案**：
```bash
# 手动验证合约
forge verify-contract \
  <CONTRACT_ADDRESS> \
  src/ProjectFactory.sol:ProjectFactory \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address,address)" <STAKE_VAULT> <TASK_MANAGER> <OWNER>)
```

### 问题：Nonce 过低

**解决方案**：
```bash
# 等待前一个交易确认，或手动指定 nonce
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --nonce <NONCE>
```

---

## 安全提示

1. **永远不要将 `.env` 文件提交到 Git**
2. **使用硬件钱包进行主网部署**
3. **部署前进行完整的安全审计**
4. **在测试网充分测试所有功能**
5. **备份所有私钥和部署记录**
6. **使用多签钱包管理合约所有权**

---

## 支持

如有问题，请查看：
- [Foundry 文档](https://book.getfoundry.sh/)
- [OpenZeppelin 文档](https://docs.openzeppelin.com/)
- [项目 README](./README.md)
