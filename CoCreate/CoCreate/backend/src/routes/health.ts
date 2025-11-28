/**
 * Health Check Routes
 */

import { Router } from 'express';
import { prisma } from '../config/database';
import { blockchainService } from '../services/blockchain';
import { logger } from '../config/logger';

const router = Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/status
 * Detailed status check (database, blockchain connection)
 */
router.get('/status', async (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      blockchain: 'unknown',
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = 'connected';
  } catch (error) {
    status.services.database = 'disconnected';
    status.status = 'degraded';
    logger.error('Database connection check failed', { error });
  }

  // Check blockchain
  try {
    await blockchainService.getCurrentBlock();
    status.services.blockchain = 'connected';
  } catch (error) {
    status.services.blockchain = 'disconnected';
    status.status = 'degraded';
    logger.error('Blockchain connection check failed', { error });
  }

  const httpStatus = status.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(status);
});

export default router;

