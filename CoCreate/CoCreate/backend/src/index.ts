/**
 * Main Server Entry Point
 * Cocreate Backend API Server
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';

// Import routes
import projectsRouter from './routes/projects';
import membersRouter from './routes/members';
import tasksRouter from './routes/tasks';
import ipfsRouter from './routes/ipfs';
import eventsRouter from './routes/events';
import healthRouter from './routes/health';

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api', membersRouter);
app.use('/api', tasksRouter);
app.use('/api/ipfs', ipfsRouter);
app.use('/api', eventsRouter);
app.use('/api', healthRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(err.status || 500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Cocreate Backend API Server started`, {
    port: config.port,
    env: config.nodeEnv,
    corsOrigin: config.corsOrigin,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

