/**
 * Tasks API Routes
 */

import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { ipfsService } from '../services/ipfs';

const router = Router();

/**
 * GET /api/projects/:projectId/tasks
 * Get all tasks for a project
 */
router.get(
  '/:projectId/tasks',
  [
    param('projectId').isInt({ min: 1 }),
    query('status').optional().isIn(['pending', 'submitted', 'under_review', 'approved', 'rejected']),
    query('assignee').optional().isEthereumAddress(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const projectId = BigInt(req.params.projectId);
      const where: any = { projectId };

      if (req.query.status) {
        where.status = req.query.status;
      }
      if (req.query.assignee) {
        where.assigneeAddress = req.query.assignee.toLowerCase();
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          nft: {
            select: {
              tokenId: true,
              metadataUri: true,
            },
          },
        },
      });

      res.json({
        tasks: tasks.map((t) => ({
          id: t.taskId.toString(),
          projectId: t.projectId.toString(),
          assignee: t.assigneeAddress,
          title: t.title,
          description: t.description,
          proofCid: t.proofCid,
          status: t.status,
          submittedAt: t.submittedAt,
          reviewedAt: t.reviewedAt,
          reviewer: t.reviewerAddress,
          createdAt: t.createdAt,
          nft: t.nft
            ? {
                tokenId: t.nft.tokenId.toString(),
                metadataUri: t.nft.metadataUri,
              }
            : null,
        })),
      });
    } catch (error) {
      logger.error('Error fetching tasks', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/tasks/:taskId
 * Get task details
 */
router.get(
  '/tasks/:taskId',
  [param('taskId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const taskId = BigInt(req.params.taskId);

      const task = await prisma.task.findUnique({
        where: { taskId },
        include: {
          project: {
            select: {
              projectId: true,
              name: true,
              ownerAddress: true,
            },
          },
          nft: true,
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({
        id: task.taskId.toString(),
        projectId: task.projectId.toString(),
        project: {
          id: task.project.projectId.toString(),
          name: task.project.name,
          owner: task.project.ownerAddress,
        },
        assignee: task.assigneeAddress,
        title: task.title,
        description: task.description,
        metadataUri: task.metadataUri,
        proofCid: task.proofCid,
        status: task.status,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt,
        reviewer: task.reviewerAddress,
        rewardAmount: task.rewardAmount,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        nft: task.nft
          ? {
              tokenId: task.nft.tokenId.toString(),
              proofCid: task.nft.proofCid,
              metadataUri: task.nft.metadataUri,
              mintedAt: task.nft.mintedAt,
            }
          : null,
      });
    } catch (error) {
      logger.error('Error fetching task', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/tasks/:taskId/proof
 * Upload proof file to IPFS for a task
 */
/**
 * POST /api/tasks/:taskId/proof
 * Upload proof file to IPFS for a task
 * Note: For MVP, this endpoint accepts JSON with base64 encoded file
 * In production, use proper multipart/form-data handling
 */
router.post(
  '/tasks/:taskId/proof',
  [param('taskId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const taskId = BigInt(req.params.taskId);
      const { file, fileName, mimeType } = req.body;

      if (!file || !fileName) {
        return res.status(400).json({ error: 'File data and fileName required' });
      }

      // Check if task exists
      const task = await prisma.task.findUnique({
        where: { taskId },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(file, 'base64');

      // Upload to IPFS
      const cid = await ipfsService.uploadFile(
        fileBuffer,
        fileName,
        mimeType || 'application/octet-stream'
      );

      // Update task with proof CID
      await prisma.task.update({
        where: { taskId },
        data: {
          proofCid: cid,
          status: 'submitted',
          submittedAt: new Date(),
        },
      });

      res.json({
        taskId: taskId.toString(),
        proofCid: cid,
        ipfsUrl: ipfsService.getFileUrl(cid),
      });
    } catch (error) {
      logger.error('Error uploading proof', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

