/**
 * Environment Configuration
 * Loads and validates all environment variables
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Blockchain
  rpcUrl: process.env.RPC_URL || '',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10),
  startBlock: parseInt(process.env.START_BLOCK || '0', 10),

  // Contract Addresses
  contracts: {
    projectFactory: process.env.PROJECT_FACTORY_ADDRESS || '',
    stakeVault: process.env.STAKE_VAULT_ADDRESS || '',
    taskManager: process.env.TASK_MANAGER_ADDRESS || '',
    contributionNft: process.env.CONTRIBUTION_NFT_ADDRESS || '',
  },

  // IPFS (Pinata)
  ipfs: {
    apiKey: process.env.PINATA_API_KEY || '',
    secretKey: process.env.PINATA_SECRET_KEY || '',
    gatewayUrl: process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/',
  },
};

// Validate required environment variables
const requiredVars = [
  'DATABASE_URL',
  'RPC_URL',
  'PROJECT_FACTORY_ADDRESS',
  'STAKE_VAULT_ADDRESS',
  'TASK_MANAGER_ADDRESS',
  'CONTRIBUTION_NFT_ADDRESS',
];

if (config.nodeEnv === 'production') {
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}

