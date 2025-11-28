/**
 * Members API Routes
 */

import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

/**
 * GET /api/projects/:projectId/members
 * Get all members of a project
 */
router.get(
  '/:projectId/members',
  [param('projectId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const projectId = BigInt(req.params.projectId);

      const members = await prisma.projectMember.findMany({
        where: { projectId },
        orderBy: { joinedAt: 'asc' },
        include: {
          _count: {
            select: {
              // Note: tasks completed/rejected are stored in the member record itself
            },
          },
        },
      });

      res.json({
        members: members.map((m) => ({
          address: m.memberAddress,
          stakedAmount: m.stakedAmount,
          status: m.status,
          joinedAt: m.joinedAt,
          tasksCompleted: m.tasksCompleted,
          tasksRejected: m.tasksRejected,
        })),
      });
    } catch (error) {
      logger.error('Error fetching members', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/projects/:projectId/members/:address
 * Get specific member details
 */
router.get(
  '/:projectId/members/:address',
  [
    param('projectId').isInt({ min: 1 }),
    param('address').isEthereumAddress(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const projectId = BigInt(req.params.projectId);
      const address = req.params.address.toLowerCase();

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_memberAddress: {
            projectId,
            memberAddress: address,
          },
        },
        include: {
          project: {
            select: {
              projectId: true,
              name: true,
              status: true,
            },
          },
        },
      });

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Get member's tasks
      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          assigneeAddress: address,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        address: member.memberAddress,
        stakedAmount: member.stakedAmount,
        status: member.status,
        joinedAt: member.joinedAt,
        tasksCompleted: member.tasksCompleted,
        tasksRejected: member.tasksRejected,
        project: {
          id: member.project.projectId.toString(),
          name: member.project.name,
          status: member.project.status,
        },
        tasks: tasks.map((t) => ({
          id: t.taskId.toString(),
          title: t.title,
          status: t.status,
          createdAt: t.createdAt,
        })),
      });
    } catch (error) {
      logger.error('Error fetching member', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

