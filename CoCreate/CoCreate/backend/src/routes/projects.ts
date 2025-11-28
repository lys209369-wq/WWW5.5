/**
 * Projects API Routes
 */

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

/**
 * GET /api/projects
 * Get all projects with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['active', 'finalized', 'cancelled']),
    query('owner').optional().isEthereumAddress(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (req.query.status) {
        where.status = req.query.status;
      }
      if (req.query.owner) {
        where.ownerAddress = req.query.owner;
      }

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
          },
        }),
        prisma.project.count({ where }),
      ]);

      res.json({
        projects: projects.map((p) => ({
          id: p.projectId.toString(),
          owner: p.ownerAddress,
          name: p.name,
          description: p.description,
          stakeAmount: p.stakeAmount,
          status: p.status,
          memberCount: p.memberCount,
          totalStaked: p.totalStaked,
          totalSlashed: p.totalSlashed,
          createdAt: p.createdAt,
          finalizedAt: p.finalizedAt,
          taskCount: p._count.tasks,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching projects', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/projects/:projectId
 * Get project details
 */
router.get(
  '/:projectId',
  [param('projectId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const projectId = BigInt(req.params.projectId);

      const project = await prisma.project.findUnique({
        where: { projectId },
        include: {
          _count: {
            select: {
              members: true,
              tasks: true,
              nfts: true,
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({
        id: project.projectId.toString(),
        owner: project.ownerAddress,
        name: project.name,
        description: project.description,
        metadataUri: project.metadataUri,
        stakeAmount: project.stakeAmount,
        status: project.status,
        memberCount: project.memberCount,
        totalStaked: project.totalStaked,
        totalSlashed: project.totalSlashed,
        createdAt: project.createdAt,
        finalizedAt: project.finalizedAt,
        stats: {
          members: project._count.members,
          tasks: project._count.tasks,
          nfts: project._count.nfts,
        },
      });
    } catch (error) {
      logger.error('Error fetching project', { error, projectId: req.params.projectId });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/projects/:projectId/stats
 * Get project statistics
 */
router.get(
  '/:projectId/stats',
  [param('projectId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const projectId = BigInt(req.params.projectId);

      const [project, tasks, members] = await Promise.all([
        prisma.project.findUnique({
          where: { projectId },
        }),
        prisma.task.findMany({
          where: { projectId },
        }),
        prisma.projectMember.findMany({
          where: { projectId },
        }),
      ]);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const taskStats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        submitted: tasks.filter((t) => t.status === 'submitted').length,
        underReview: tasks.filter((t) => t.status === 'under_review').length,
        approved: tasks.filter((t) => t.status === 'approved').length,
        rejected: tasks.filter((t) => t.status === 'rejected').length,
      };

      const memberStats = {
        total: members.length,
        staked: members.filter((m) => m.status === 'staked').length,
        returned: members.filter((m) => m.status === 'returned').length,
        slashed: members.filter((m) => m.status === 'slashed').length,
      };

      res.json({
        project: {
          id: project.projectId.toString(),
          name: project.name,
          status: project.status,
        },
        tasks: taskStats,
        members: memberStats,
        stakes: {
          total: project.totalStaked,
          slashed: project.totalSlashed,
        },
      });
    } catch (error) {
      logger.error('Error fetching project stats', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/users/:address/projects
 * Get projects by user address (created or joined)
 */
router.get(
  '/user/:address',
  [param('address').isEthereumAddress()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const address = req.params.address.toLowerCase();

      const [created, joined] = await Promise.all([
        prisma.project.findMany({
          where: { ownerAddress: address },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.projectMember.findMany({
          where: { memberAddress: address },
          include: { project: true },
          orderBy: { joinedAt: 'desc' },
        }),
      ]);

      res.json({
        created: created.map((p) => ({
          id: p.projectId.toString(),
          name: p.name,
          status: p.status,
          createdAt: p.createdAt,
        })),
        joined: joined.map((m) => ({
          id: m.project.projectId.toString(),
          name: m.project.name,
          status: m.project.status,
          memberStatus: m.status,
          joinedAt: m.joinedAt,
        })),
      });
    } catch (error) {
      logger.error('Error fetching user projects', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

