/**
 * IPFS Service
 * Handles file uploads to IPFS using Pinata
 */

import FormData from 'form-data';
import fetch from 'node-fetch';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

export class IpfsService {
  private apiKey: string;
  private secretKey: string;
  private gatewayUrl: string;

  constructor() {
    this.apiKey = config.ipfs.apiKey;
    this.secretKey = config.ipfs.secretKey;
    this.gatewayUrl = config.ipfs.gatewayUrl;

    if (!this.apiKey || !this.secretKey) {
      logger.warn('IPFS credentials not configured. IPFS uploads will fail.');
    }
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: Buffer, fileName: string, mimeType?: string): Promise<string> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('IPFS credentials not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', file, {
        filename: fileName,
        contentType: mimeType || 'application/octet-stream',
      });

      // Pinata metadata
      const metadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', metadata);

      // Pinata options
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata API error: ${error}`);
      }

      const data = (await response.json()) as { IpfsHash: string; PinSize: number };
      const cid = data.IpfsHash;

      // Store in database
      await prisma.ipfsFile.create({
        data: {
          cid,
          fileName,
          fileSize: BigInt(file.length),
          mimeType: mimeType || 'application/octet-stream',
          pinStatus: 'pinned',
        },
      });

      logger.info('File uploaded to IPFS', { cid, fileName, size: file.length });

      return cid;
    } catch (error) {
      logger.error('Error uploading file to IPFS', { fileName, error });
      throw error;
    }
  }

  /**
   * Get IPFS file URL
   */
  getFileUrl(cid: string): string {
    return `${this.gatewayUrl}${cid}`;
  }

  /**
   * Get IPFS file metadata from database
   */
  async getFileMetadata(cid: string) {
    return await prisma.ipfsFile.findUnique({
      where: { cid },
    });
  }
}

export const ipfsService = new IpfsService();

