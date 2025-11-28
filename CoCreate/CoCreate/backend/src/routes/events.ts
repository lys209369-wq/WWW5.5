/**
 * Events API Routes
 * Get blockchain events for projects
 */

import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

/**
 * GET /api/projects/:projectId/events
 * Get events for a specific project
 */
router.get(
  '/:projectId/events',
  [
    param('projectId').isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const projectId = BigInt(req.params.projectId);
      const limit = parseInt(req.query.limit as string) || 50;

      const events = await prisma.blockchainEvent.findMany({
        where: { projectId },
        orderBy: { blockNumber: 'desc' },
        take: limit,
      });

      res.json({
        events: events.map((e) => ({
          id: e.id.toString(),
          eventName: e.eventName,
          contractAddress: e.contractAddress,
          transactionHash: e.transactionHash,
          blockNumber: e.blockNumber.toString(),
          projectId: e.projectId?.toString(),
          taskId: e.taskId?.toString(),
          userAddress: e.userAddress,
          eventData: e.eventData,
          createdAt: e.createdAt,
        })),
      });
    } catch (error) {
      logger.error('Error fetching events', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/events/recent
 * Get recent events across all projects
 */
router.get(
  '/recent',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = parseInt(req.query.limit as string) || 50;

      const events = await prisma.blockchainEvent.findMany({
        orderBy: { blockNumber: 'desc' },
        take: limit,
        include: {
          project: {
            select: {
              projectId: true,
              name: true,
            },
          },
        },
      });

      res.json({
        events: events.map((e) => ({
          id: e.id.toString(),
          eventName: e.eventName,
          contractAddress: e.contractAddress,
          transactionHash: e.transactionHash,
          blockNumber: e.blockNumber.toString(),
          projectId: e.projectId?.toString(),
          project: e.project
            ? {
                id: e.project.projectId.toString(),
                name: e.project.name,
              }
            : null,
          taskId: e.taskId?.toString(),
          userAddress: e.userAddress,
          eventData: e.eventData,
          createdAt: e.createdAt,
        })),
      });
    } catch (error) {
      logger.error('Error fetching recent events', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

