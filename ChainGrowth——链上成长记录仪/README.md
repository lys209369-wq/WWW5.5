# ChainGrowth | 链上成长记录仪

**ChainGrowth** 是一个融合了 **Web3 理念**与 **生成式 AI** 的个人成长追踪应用。它不仅仅是一个待办事项列表，更是一个将用户的日常努力转化为不可篡改的链上资产（On-Chain Assets）的数字生态系统。

通过记录每日的学习、工作与生活任务，结合 Google Gemini AI 的深度分析，ChainGrowth 为用户生成专属的成长报告，并以“灵魂绑定代币”（SBT）的形式颁发成就勋章，让每一次进步都不仅被看见，更被永久铭记。

---

## 🌟 核心理念 (Core Philosophy)

1.  **成长资产化 (Growth as Asset)**: 你的每一次努力（完成任务）都像是一笔链上交易（Transaction），具有唯一性和不可篡改性。
2.  **AI 赋能复盘 (AI-Powered Review)**: 利用先进的大语言模型，不仅记录“做了什么”，更分析“做得如何”，提供情感支持与行动建议。
3.  **游戏化激励 (Gamification)**: 通过 NFT/SBT 勋章体系，将枯燥的自律转化为可视化的荣誉墙。

---

## 🚀 主要功能 (Key Features)

### 1. 📅 链上日历与待办 (Dashboard & Calendar)
- **可视化日历**: 这是一个交互式的月视图日历，用户可以直观地查看每一天的任务分布。
- **任务管理**: 支持创建不同类别的任务（学习、工作、健康、生活）。
- **Web3 模拟体验**:
  - 任务创建与完成模拟了区块链的“区块确认”时间。
  - 完成的任务会生成唯一的 `TxHash`（交易哈希），赋予任务仪式感。
- **状态追踪**: 通过直观的视觉标记（绿色圆点）展示每日的完成情况。

### 2. 🤖 AI 智慧周报 (AI Weekly Review)
- **智能分析**: 集成 **Google Gemini 2.5 Flash** 模型。
- **深度洞察**: 系统会自动提取用户一周的完成/未完成任务数据，生成结构化的 JSON 报告，包含：
  - **核心收获 (Key Takeaways)**: 本周的三个主要亮点。
  - **成长关联 (Growth Connections)**: 任务与个人长期目标的联系。
  - **场景复盘 (Scenario Review)**: 针对特定挑战或模式的分析。
  - **行动建议 (Suggestions)**: 下周的具体改进措施。
  - **结语 (Closing Comment)**: 一句激励人心的话语。
- **报告上链**:生成的周报也会模拟存储在链上，成为用户的永久成长档案。

### 3. 🎖️ 勋章墙 (NFT Badge Gallery)
- **SBT 系统**: 勋章被设计为灵魂绑定代币（Soulbound Tokens），不可转移，代表用户的真实成就。
- **自动解锁机制**:
  - **求知星芒 (Knowledge)**: 基于学习类任务的数量（如：完成5个学习任务）。
  - **坚韧心智 (Mindset)**: 基于行为模式（如：连续3天全勤、抗压能力）。
- **视觉特效**: 解锁勋章时伴随炫酷的 Web3 风格弹窗动画与光效。

---

## 🛠️ 技术栈 (Tech Stack)

### 前端框架
- **React 19**: 使用最新的 React 版本，利用 Hooks 进行状态管理。
- **Vite**:以此作为极速构建工具。
- **TypeScript**: 强类型语言，确保代码的健壮性与可维护性。

### UI/UX 设计
- **Tailwind CSS**: 原子化 CSS 框架，构建响应式布局。
- **Web3 Aesthetic**: 采用深色模式（Dark Mode），配合极光渐变、玻璃拟态（Glassmorphism）和精致的微交互，营造沉浸式的 Web3 氛围。

### 人工智能 (AI)
- **Google GenAI SDK (@google/genai)**:
  - 模型: `gemini-2.5-flash`
  - 特性: 使用 `responseSchema` 强制输出标准 JSON 格式，确保前端渲染的稳定性。

### 数据层 (Mock Web3)
- **MockWeb3Service**: 目前采用模拟服务层，模拟区块链的异步特性（延时）、哈希生成和不可篡改逻辑，为未来接入真实的主网（如 Ethereum, Polygon）做好了架构准备。

---

## 📂 项目结构

```
src/
├── components/       # UI 组件 (日历、AI复盘页、勋章墙)
├── services/         # 业务逻辑层
│   ├── geminiService.ts  # Google Gemini API 调用封装
│   └── mockWeb3Service.ts # 模拟区块链交互服务
├── types.ts          # TypeScript 类型定义
├── constants.ts      # 常量与配置 (勋章元数据、颜色)
└── App.tsx           # 主应用入口
```

---

## 🔮 未来规划 (Roadmap)

1.  **真实上链**: 接入 RainbowKit/Wagmi，支持 MetaMask 钱包登录，将数据存储在 IPFS 或 Arweave 上。
2.  **社交互动**: 允许用户铸造（Mint）并分享他们的周报 NFT 到社交媒体。
3.  **更多 AI 场景**: 引入 Gemini 对每日任务的实时建议和优先级排序。
