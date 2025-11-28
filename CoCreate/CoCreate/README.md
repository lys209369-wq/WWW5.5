# Cocreate - Stake-Based Web3 Collaboration Tool

> 一个基于质押承诺和链上贡献记录的 Web3 协作工具

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)

---

## 📖 项目概述

Cocreate 是一个创新的 Web3 协作平台，通过智能合约实现：

- ✅ **质押承诺机制** - 成员加入项目需质押保证金
- ✅ **任务证明系统** - 提交 IPFS 存储的工作证明
- ✅ **自动化结算** - 智能合约自动释放或罚没质押
- ✅ **链上贡献记录** - 铸造 SBT（Soulbound Token）作为贡献证明
- ✅ **透明化协作** - 所有流程公开透明，可验证

**适用场景**: Hackathon、DAO 工作组、小型项目团队

---

## 🏗️ 项目架构

本项目采用 **前后端分离** 的 DApp 架构：

```
cocreate-canvas/
├── contracts/              # 智能合约层（Foundry）
│   ├── src/               # Solidity 合约
│   ├── script/            # 部署脚本
│   ├── test/              # 合约测试
│   └── lib/               # 依赖库
│
├── frontend/              # 前端层（React + Vite）
│   ├── src/               # React 组件
│   ├── public/            # 静态资源
│   └── package.json       # 前端依赖
│
├── DEPLOYMENT.md          # 部署文档
├── prod.md                # 产品需求文档
└── README.md              # 本文件
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18
- **Foundry** (智能合约开发)
- **MetaMask** 或其他 Web3 钱包

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/cocreate-canvas.git
cd cocreate-canvas
```

### 2. 智能合约开发

```bash
# 进入合约目录
cd contracts

# 安装依赖
forge install

# 编译合约
forge build

# 运行测试
forge test

# 本地部署（需要先启动 anvil）
anvil  # 在另一个终端
forge script script/Deploy.s.sol --rpc-url localhost --broadcast
```

详细文档请查看 [contracts/README.md](./contracts/README.md)

### 3. 前端开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
# 或使用 bun
bun install

# 启动开发服务器
npm run dev

# 访问 http://localhost:8080
```

详细文档请查看 [frontend/README.md](./frontend/README.md)

---

## 🎯 核心功能

### 1. 创建项目

项目所有者可以创建项目并设置质押金额：

```solidity
function createProject(
    string calldata name,
    string calldata metadataURI,
    uint96 stakeAmount
) external returns (uint256 projectId)
```

### 2. 加入项目

成员通过质押加入项目：

```solidity
function joinProject(uint256 projectId) external payable
```

### 3. 任务管理

- **创建任务**: 项目所有者分配任务给成员
- **提交证明**: 成员完成后提交 IPFS 证明
- **审核任务**: 项目所有者审核任务

### 4. 自动结算

- **批准**: 释放质押 + 铸造贡献 NFT
- **拒绝**: 罚没质押（转给项目所有者）

---

## 📦 智能合约

### 核心合约

| 合约 | 功能 | 地址 |
|------|------|------|
| ProjectFactory | 项目管理、成员加入 | TBD |
| StakeVault | 质押资金管理 | TBD |
| TaskManager | 任务创建、审核 | TBD |
| ContributionNFT | SBT 铸造 | TBD |

### 合约架构

```
┌─────────────────────────────────────────┐
│         ProjectFactory (核心协调)        │
│  - 创建项目                              │
│  - 成员管理                              │
│  - 项目结算                              │
└─────────────────────────────────────────┘
           │                │
           ▼                ▼
┌──────────────────┐  ┌──────────────────┐
│   StakeVault     │  │   TaskManager    │
│  - 质押存入      │  │  - 任务创建      │
│  - 质押释放      │  │  - 证明提交      │
│  - 质押罚没      │  │  - 任务审核      │
└──────────────────┘  └──────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │ ContributionNFT  │
                   │  - SBT 铸造      │
                   │  - 贡献记录      │
                   └──────────────────┘
```

---

## 🔒 安全特性

- ✅ **ReentrancyGuard** - 防止重入攻击
- ✅ **Pull Payment** - 安全的资金提取模式
- ✅ **Pausable** - 紧急暂停功能
- ✅ **AccessControl** - 细粒度权限管理
- ✅ **Soulbound Token** - 不可转让的贡献证明
- ✅ **Gas 优化** - 使用 `via-ir` 编译优化

---

## 🧪 测试

### 合约测试

```bash
cd contracts

# 运行所有测试
forge test

# 查看 Gas 报告
forge test --gas-report

# 测试覆盖率
forge coverage
```

### 前端测试

```bash
cd frontend

# 运行测试（待实现）
npm test
```

---

## 📚 部署

### 测试网部署

详细部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
cd contracts

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入实际值

# 部署到 Sepolia 测试网
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### 前端部署

```bash
cd frontend

# 构建生产版本
npm run build

# 部署到 Vercel/Netlify
# 设置环境变量（合约地址）
```

---

## 🛠️ 技术栈

### 智能合约

- **Solidity** 0.8.24
- **Foundry** (开发框架)
- **OpenZeppelin** (合约库)

### 前端

- **React** 18 + TypeScript
- **Vite** (构建工具)
- **Tailwind CSS** + shadcn/ui
- **wagmi** + viem (Web3 集成)
- **RainbowKit** (钱包连接)

---

## 📖 文档

- [智能合约文档](./contracts/README.md)
- [前端文档](./frontend/README.md)
- [部署指南](./DEPLOYMENT.md)
- [产品需求文档](./prod.md)

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 开发路线图

- [x] 智能合约架构设计
- [x] 核心合约实现
- [x] 部署脚本
- [ ] 合约单元测试
- [ ] 前端 Web3 集成
- [ ] IPFS 集成
- [ ] 测试网部署
- [ ] 安全审计
- [ ] 主网部署

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

---

## 🙏 致谢

- [OpenZeppelin](https://openzeppelin.com/) - 安全的智能合约库
- [Foundry](https://book.getfoundry.sh/) - 强大的开发框架
- [shadcn/ui](https://ui.shadcn.com/) - 优秀的 UI 组件库

---

## 📞 联系方式

- **GitHub**: [your-username](https://github.com/your-username)
- **Twitter**: [@your-twitter](https://twitter.com/your-twitter)
- **Email**: your-email@example.com

---

**Built with ❤️ by the Cocreate Team**
