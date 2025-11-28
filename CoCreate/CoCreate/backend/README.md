# Cocreate Backend API

Backend API server for Cocreate DApp - handles database indexing, IPFS uploads, and blockchain event synchronization.

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────────────────┐
│   Backend API Server    │
│  (Express + TypeScript) │
└──────┬──────────────────┘
       │
   ┌───┴───┬──────────┬──────────┐
   │       │          │          │
┌──▼──┐ ┌──▼──┐  ┌───▼───┐  ┌───▼────┐
│PostgreSQL│ │IPFS│  │Blockchain│  │Event    │
│          │ │(Pinata)│ │(ethers.js)│ │Listener │
└──────────┘ └──────┘  └──────────┘  └─────────┘
```

## 📋 Features

- **REST API** - Query projects, tasks, members, events
- **IPFS Integration** - Upload proof files via Pinata
- **Event Listener** - Sync blockchain events to database
- **Database Indexing** - Fast queries for frontend

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

Create a PostgreSQL database:

```bash
# Using psql
createdb cocreate

# Or using Docker
docker run --name cocreate-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cocreate -p 5432:5432 -d postgres:15
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `RPC_URL` - Ethereum RPC endpoint (Sepolia for testing)
- `PROJECT_FACTORY_ADDRESS` - Deployed contract address
- `STAKE_VAULT_ADDRESS` - Deployed contract address
- `TASK_MANAGER_ADDRESS` - Deployed contract address
- `CONTRIBUTION_NFT_ADDRESS` - Deployed contract address
- `PINATA_API_KEY` - Pinata API key (get from https://pinata.cloud)
- `PINATA_SECRET_KEY` - Pinata secret key

### 4. Run Database Migrations

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
```

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will start on `http://localhost:3000`

### 6. Start Event Listener (Separate Process)

In a new terminal:

```bash
npm run event:sync
```

This will listen to blockchain events and sync them to the database.

## 📡 API Endpoints

### Projects

- `GET /api/projects` - List all projects (with pagination)
- `GET /api/projects/:projectId` - Get project details
- `GET /api/projects/:projectId/stats` - Get project statistics
- `GET /api/users/:address/projects` - Get user's projects

### Members

- `GET /api/projects/:projectId/members` - Get project members
- `GET /api/projects/:projectId/members/:address` - Get member details

### Tasks

- `GET /api/projects/:projectId/tasks` - Get project tasks
- `GET /api/tasks/:taskId` - Get task details
- `POST /api/tasks/:taskId/proof` - Upload proof file (base64 JSON)

### IPFS

- `GET /api/ipfs/:cid` - Get IPFS file metadata

### Events

- `GET /api/projects/:projectId/events` - Get project events
- `GET /api/events/recent` - Get recent events

### Health

- `GET /api/health` - Health check
- `GET /api/status` - Detailed status (database, blockchain)

## 🗄️ Database Schema

See `prisma/schema.prisma` for full schema. Main tables:

- `projects` - Project information
- `project_members` - Member data
- `tasks` - Task information
- `contribution_nfts` - NFT records
- `blockchain_events` - Event logs
- `ipfs_files` - IPFS file metadata

## 🔄 Event Listener

The event listener service:

1. Listens to blockchain events from all contracts
2. Stores events in `blockchain_events` table
3. Updates database state (projects, tasks, members, NFTs)
4. Handles idempotency (prevents duplicate processing)

To start:

```bash
npm run event:sync
```

Configure `START_BLOCK` in `.env` to start from a specific block (or 0 to sync from deployment).

## 🧪 Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Get projects
curl http://localhost:3000/api/projects

# Get project details
curl http://localhost:3000/api/projects/1
```

### Test IPFS Upload

```bash
# Convert file to base64
FILE_BASE64=$(base64 -i path/to/file.pdf)

# Upload proof
curl -X POST http://localhost:3000/api/tasks/1/proof \
  -H "Content-Type: application/json" \
  -d "{
    \"file\": \"$FILE_BASE64\",
    \"fileName\": \"proof.pdf\",
    \"mimeType\": \"application/pdf\"
  }"
```

## 📦 Deployment

### Environment Variables

Set all required environment variables in your deployment platform.

### Database

Use a managed PostgreSQL service (e.g., Supabase, Neon, Railway).

### Event Listener

Run the event listener as a separate process or background job:

```bash
npm run event:sync
```

Or use a process manager like PM2:

```bash
pm2 start npm --name "event-listener" -- run event:sync
```

### Production Build

```bash
npm run build
npm start
```

## 🔧 Development

### Database Studio

View database in browser:

```bash
npm run db:studio
```

### Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only

## 📝 Notes

- **File Upload**: Currently accepts base64 encoded files in JSON. For production, consider using proper multipart/form-data handling.
- **Event Sync**: The event listener should run continuously to keep database in sync with blockchain.
- **IPFS**: Uses Pinata for file storage. Free tier available.

## 🐛 Troubleshooting

### Database Connection Error

- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings

### Blockchain Connection Error

- Verify `RPC_URL` is correct
- Check contract addresses are set
- Ensure RPC endpoint is accessible

### Event Listener Not Syncing

- Check `START_BLOCK` is set correctly
- Verify contract addresses
- Check RPC connection
- Review logs in `logs/combined.log`

## 📚 Related Documentation

- [Frontend README](../frontend/README.md)
- [Contract Deployment](../DEPLOYMENT.md)
- [Product Requirements](../prod.md)

