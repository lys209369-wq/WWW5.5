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

