/**
 * IPFS API Routes
 */

import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import { ipfsService } from '../services/ipfs';
import { logger } from '../config/logger';

const router = Router();

/**
 * POST /api/ipfs/upload
 * Upload file to IPFS
 */
router.post('/upload', async (req, res) => {
  try {
    // This endpoint expects multipart/form-data with a 'file' field
    // For simplicity, we'll handle it in the tasks route
    // This is a placeholder for direct IPFS uploads if needed
    res.status(501).json({ error: 'Use /api/tasks/:taskId/proof endpoint' });
  } catch (error) {
    logger.error('Error in IPFS upload', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/ipfs/:cid
 * Get IPFS file metadata
 */
router.get(
  '/:cid',
  [param('cid').isLength({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const cid = req.params.cid;
      const metadata = await ipfsService.getFileMetadata(cid);

      if (!metadata) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json({
        cid: metadata.cid,
        fileName: metadata.fileName,
        fileSize: metadata.fileSize?.toString(),
        mimeType: metadata.mimeType,
        uploadedAt: metadata.uploadedAt,
        ipfsUrl: ipfsService.getFileUrl(cid),
      });
    } catch (error) {
      logger.error('Error fetching IPFS file', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

