# 🚀 Cocreate Backend 快速开始指南

## 前置要求

- Node.js >= 18
- PostgreSQL 数据库
- Pinata 账号（免费注册：https://pinata.cloud）

## 5 分钟快速启动

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置数据库

创建 PostgreSQL 数据库：

```bash
# 使用 psql
createdb cocreate

# 或使用 Docker
docker run --name cocreate-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cocreate \
  -p 5432:5432 \
  -d postgres:15
```

### 3. 配置环境变量

复制环境变量文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/cocreate?schema=public"

# 区块链（Sepolia 测试网）
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CHAIN_ID=11155111

# 合约地址（部署后更新）
PROJECT_FACTORY_ADDRESS=0x...
STAKE_VAULT_ADDRESS=0x...
TASK_MANAGER_ADDRESS=0x...
CONTRIBUTION_NFT_ADDRESS=0x...

# IPFS (Pinata)
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret

# 其他
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 运行迁移
npm run db:migrate
```

### 5. 启动服务

**终端 1 - API 服务器：**
```bash
npm run dev
```

**终端 2 - 事件监听器：**
```bash
npm run event:sync
```

### 6. 测试 API

```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取项目列表
curl http://localhost:3000/api/projects
```

## 📝 下一步

1. **部署智能合约** - 参考 `../DEPLOYMENT.md`
2. **更新合约地址** - 在 `.env` 中填入部署的合约地址
3. **配置 START_BLOCK** - 设置为合约部署的区块号（跳过历史事件）
4. **连接前端** - 前端配置 API 地址为 `http://localhost:3000`

## 🔍 验证安装

### 检查数据库连接

```bash
npm run db:studio
```

在浏览器中打开 Prisma Studio，查看数据库表。

### 检查区块链连接

访问 `http://localhost:3000/api/status`，应该看到：

```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "blockchain": "connected"
  }
}
```

## 🐛 常见问题

### 数据库连接失败

- 检查 PostgreSQL 是否运行
- 验证 `DATABASE_URL` 格式
- 确认数据库已创建

### 区块链连接失败

- 检查 `RPC_URL` 是否正确
- 验证网络连接
- 确认合约地址已设置

### 事件监听器不工作

- 检查 `START_BLOCK` 设置
- 查看日志文件 `logs/combined.log`
- 确认合约地址正确

## 📚 更多文档

- [完整 README](./README.md)
- [架构文档](./BACKEND_ARCHITECTURE.md)
- [API 文档](./README.md#api-endpoints)

