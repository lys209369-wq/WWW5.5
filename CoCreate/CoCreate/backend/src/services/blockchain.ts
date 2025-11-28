/**
 * Blockchain Service
 * Handles interactions with smart contracts using ethers.js
 */

import { ethers } from 'ethers';
import { config } from '../config/env';
import { logger } from '../config/logger';

// Contract ABIs - load from JSON files
import * as fs from 'fs';
import * as path from 'path';

const loadABI = (filename: string) => {
  const filePath = path.join(__dirname, '../../contracts/abis', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const ProjectFactoryABI = loadABI('ProjectFactory.json');
const TaskManagerABI = loadABI('TaskManager.json');
const StakeVaultABI = loadABI('StakeVault.json');
const ContributionNFTABI = loadABI('ContributionNFT.json');

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private projectFactory: ethers.Contract;
  private taskManager: ethers.Contract;
  private stakeVault: ethers.Contract;
  private contributionNft: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // Initialize contracts
    this.projectFactory = new ethers.Contract(
      config.contracts.projectFactory,
      ProjectFactoryABI,
      this.provider
    );

    this.taskManager = new ethers.Contract(
      config.contracts.taskManager,
      TaskManagerABI,
      this.provider
    );

    this.stakeVault = new ethers.Contract(
      config.contracts.stakeVault,
      StakeVaultABI,
      this.provider
    );

    this.contributionNft = new ethers.Contract(
      config.contracts.contributionNft,
      ContributionNFTABI,
      this.provider
    );

    logger.info('Blockchain service initialized', {
      network: config.rpcUrl,
      chainId: config.chainId,
    });
  }

  /**
   * Get project information from blockchain
   */
  async getProject(projectId: bigint) {
    try {
      const project = await this.projectFactory.getProject(projectId);
      return {
        id: project.id.toString(),
        owner: project.owner,
        name: project.name,
        metadataURI: project.metadataURI,
        stakeAmount: project.stakeAmount.toString(),
        status: project.status,
        createdAt: project.createdAt,
        memberCount: project.memberCount,
        totalStaked: project.totalStaked.toString(),
        totalSlashed: project.totalSlashed.toString(),
      };
    } catch (error) {
      logger.error('Error fetching project from blockchain', { projectId, error });
      throw error;
    }
  }

  /**
   * Get member information from blockchain
   */
  async getMember(projectId: bigint, memberAddress: string) {
    try {
      const member = await this.projectFactory.getMember(projectId, memberAddress);
      return {
        memberAddress: member.memberAddress,
        stakedAmount: member.stakedAmount.toString(),
        joinedAt: member.joinedAt,
        status: member.status,
        tasksCompleted: member.tasksCompleted,
        tasksRejected: member.tasksRejected,
      };
    } catch (error) {
      logger.error('Error fetching member from blockchain', { projectId, memberAddress, error });
      throw error;
    }
  }

  /**
   * Get task information from blockchain
   */
  async getTask(taskId: bigint) {
    try {
      const task = await this.taskManager.getTaskInfo(taskId);
      return {
        id: task.id.toString(),
        projectId: task.projectId.toString(),
        assignee: task.assignee,
        title: task.title,
        metadataURI: task.metadataURI,
        proofCID: task.proofCID,
        status: task.status,
        submittedAt: task.submittedAt,
        reviewedAt: task.reviewedAt,
        rewardAmount: task.rewardAmount.toString(),
      };
    } catch (error) {
      logger.error('Error fetching task from blockchain', { taskId, error });
      throw error;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number) {
    return await this.provider.getBlock(blockNumber);
  }

  /**
   * Get contract instances (for event listening)
   */
  getContracts() {
    return {
      projectFactory: this.projectFactory,
      taskManager: this.taskManager,
      stakeVault: this.stakeVault,
      contributionNft: this.contributionNft,
      provider: this.provider,
    };
  }
}

export const blockchainService = new BlockchainService();

