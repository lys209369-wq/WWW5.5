# Cocreate 前端应用

这是 Cocreate 项目的前端层，使用 React + Vite + TypeScript 构建。

## 📋 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署](#部署)

---

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS + shadcn/ui
- **Web3**: wagmi + viem + RainbowKit
- **状态管理**: React Hooks
- **路由**: React Router
- **包管理**: npm / bun

---

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
# 或使用 bun
bun install
```

### 启动开发服务器

```bash
npm run dev
# 或
bun dev
```

访问 http://localhost:8080

### 构建生产版本

```bash
npm run build
# 或
bun run build
```

---

## 项目结构

```
frontend/
├── src/
│   ├── components/         # React 组件
│   │   ├── ui/            # shadcn/ui 基础组件
│   │   ├── Header.tsx     # 页面头部
│   │   ├── WalletButton.tsx  # 钱包连接按钮
│   │   ├── ProjectCard.tsx   # 项目卡片
│   │   ├── TaskCard.tsx      # 任务卡片
│   │   └── ...
│   ├── pages/             # 页面组件
│   │   ├── Index.tsx      # 首页
│   │   ├── CreateProject.tsx  # 创建项目
│   │   ├── ProjectDetail.tsx  # 项目详情
│   │   └── NotFound.tsx   # 404 页面
│   ├── hooks/             # 自定义 Hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/               # 工具函数
│   │   ├── utils.ts       # 通用工具
│   │   └── mockData.ts    # 模拟数据
│   ├── App.tsx            # 应用入口
│   ├── main.tsx           # 主入口
│   └── index.css          # 全局样式
├── public/                # 静态资源
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tailwind.config.ts     # Tailwind 配置
└── package.json
```

---

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `App.tsx` 中添加路由

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 使用 shadcn/ui 基础组件构建 UI

### 使用 shadcn/ui

添加新的 UI 组件：

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

### Web3 集成

使用 wagmi hooks 与智能合约交互：

```typescript
import { useReadContract, useWriteContract } from 'wagmi'

// 读取合约数据
const { data } = useReadContract({
  address: '0x...',
  abi: ProjectFactoryABI,
  functionName: 'getProject',
  args: [projectId],
})

// 写入合约
const { writeContract } = useWriteContract()
writeContract({
  address: '0x...',
  abi: ProjectFactoryABI,
  functionName: 'createProject',
  args: [name, metadataURI, stakeAmount],
})
```

---

## 环境变量

创建 `.env.local` 文件：

```env
# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# 合约地址（部署后填入）
VITE_PROJECT_FACTORY_ADDRESS=0x...
VITE_STAKE_VAULT_ADDRESS=0x...
VITE_TASK_MANAGER_ADDRESS=0x...
VITE_CONTRIBUTION_NFT_ADDRESS=0x...

# RPC 端点（可选）
VITE_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/your-api-key
```

---

## 部署

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 设置根目录为 `frontend`
3. 设置环境变量
4. 自动部署

### Netlify 部署

1. 连接 GitHub 仓库
2. 构建设置：
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. 设置环境变量

### 手动部署

```bash
cd frontend
npm run build
# 将 dist/ 目录部署到静态托管服务
```

---

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 代码检查
npm run lint         # ESLint 检查
npm run type-check   # TypeScript 类型检查

# 添加 UI 组件
npx shadcn@latest add <component-name>
```

---

## 相关资源

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [wagmi 文档](https://wagmi.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/)

---

## 许可证

MIT
