# CoTime

## 项目简介
CoTime是一个基于区块链技术的协作打卡平台，旨在帮助用户通过智能合约建立可信任的打卡项目，促进团队或个人之间的协作与坚持。

## 核心功能

### 1. 项目管理
- **创建打卡项目**：用户可以设置项目名称、主题、打卡天数和成员上限
- **项目列表查看**：浏览所有参与或创建的打卡项目
- **项目详情**：查看项目进度、成员列表和打卡记录

### 2. 打卡功能
- **每日打卡**：项目成员可以在规定时间内进行打卡
- **打卡记录**：记录每次打卡的时间和相关信息
- **连续打卡统计**：追踪用户的连续打卡天数

### 3. 区块链特性
- **智能合约**：所有项目和打卡数据存储在区块链上
- **钱包集成**：支持通过加密钱包登录和交互
- **透明可信**：打卡记录不可篡改，确保公平性

## 技术栈

### 前端
- **框架**：React.js
- **状态管理**：React Context API
- **样式**：Tailwind CSS
- **区块链交互**：ethers.js

### 后端
- **智能合约**：Solidity
- **开发框架**：Hardhat
- **测试网络**：支持本地开发网络和测试网部署

## 安装与部署

### 前置要求
- Node.js v14+ 或更高版本
- npm 或 yarn 包管理器
- MetaMask 或其他以太坊钱包

### 本地开发

#### 1. 克隆项目
```bash
git clone <项目仓库地址>
cd CoTime
```

#### 2. 安装依赖
```bash
# 安装智能合约依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

#### 3. 启动本地开发网络
```bash
npx hardhat node
```

#### 4. 部署智能合约到本地网络
```bash
npx hardhat run scripts/deploy.js --network localhost
```

#### 5. 启动前端应用
```bash
cd frontend
npm start
```

前端应用将在 http://localhost:3000 上运行

### 构建生产版本
```bash
cd frontend
npm run build
```
构建产物将生成在 `frontend/build` 目录中

## 使用说明

### 1. 连接钱包
- 访问应用首页，点击"连接钱包"按钮
- 选择您的钱包（如MetaMask）并授权连接

### 2. 创建项目
- 在"我的项目"页面，点击"创建新项目"按钮
- 填写项目名称、主题、打卡天数和成员上限
- 点击"发布项目"按钮，确认钱包交易

### 3. 加入项目
- 在首页浏览可加入的项目
- 点击感兴趣的项目卡片，进入详情页面
- 点击"加入项目"按钮，确认钱包交易

### 4. 每日打卡
- 在项目详情页面，点击"今日打卡"按钮
- 确认打卡内容并提交
- 交易确认后，打卡成功

## 智能合约

主要合约文件位于 `contracts/CoTime.sol`，提供以下核心功能：

- `publishProject`：创建新的打卡项目
- `joinProject`：加入现有项目
- `checkIn`：执行打卡操作
- `endProject`：结束项目（仅项目创建者可操作）

## 项目结构

项目结构大致如下
```
cotime/
├── .github/                # GitHub配置（可选，用于CI/CD、贡献指南）
│   └── workflows/          # GitHub Actions自动化部署配置
├── contracts/              # 智能合约源码
│   ├── CoTime.sol          # 核心合约（打卡+NFT）
│   └── interfaces/         # 接口文件（可选，如VRF接口）
├── scripts/                # 部署脚本（Hardhat/Truffle）
│   └── deploy.js           # 合约部署脚本
├── test/                   # 合约测试用例
│   └── CoTime.test.js      # 核心合约测试
├── frontend/               # 前端代码（React/Vue）
│   ├── public/             # 前端静态资源
│   ├── src/                # 前端源码
│   │   ├── components/     # UI组件（如ProjectCard、CheckInForm）
│   │   ├── hooks/          # 自定义Hooks（如useContract、useIPFS）
│   │   ├── contexts/       # 钱包上下文（如Web3Context）
│   │   ├── utils/          # 工具函数（如签名、IPFS上传）
│   │   ├── App.js          # 前端入口组件
│   │   └── index.js        # 前端渲染入口
│   ├── package.json        # 前端依赖
│   └── .env.example        # 前端环境变量示例（合约地址、Pinata API）
├── hardhat.config.js       # Hardhat配置（合约编译、部署网络）
├── package.json            # 根项目依赖（合约开发相关）
├── README.md               # 项目说明文档（必选）
├── LICENSE                 # 开源许可证（可选，如MIT）
└── .gitignore              # Git忽略文件（node_modules、env等）
```

前端结构大概如下

```
src/
├── components/       # UI组件
│   ├── ConnectWallet.js  # 钱包连接
│   ├── ProjectCard.js    # 项目卡片
│   ├── PublishProject.js # 发布项目
│   ├── JoinProject.js    # 加入项目
│   └── CheckInForm.js    # 打卡表单
├── contexts/         # 钱包上下文
│   └── Web3Context.js    # 全局钱包状态
├── utils/            # 工具函数
│   ├── contract.js       # 合约ABI和地址
│   ├── ipfs.js           # IPFS上传
│   └── signature.js      # 签名工具
├── pages/            # 页面
│   ├── Home.js           # 首页（广场）
│   ├── ProjectDetail.js  # 项目详情
│   └── MyProjects.js     # 我的项目
├── App.js            # 路由入口
└── index.js          # 渲染入口