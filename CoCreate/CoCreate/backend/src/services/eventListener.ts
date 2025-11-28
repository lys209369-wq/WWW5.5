/**
 * Event Listener Service
 * Listens to blockchain events and syncs them to the database
 */

import { ethers } from 'ethers';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { blockchainService } from './blockchain';

export class EventListenerService {
  private isRunning = false;
  private currentBlock: number;
  private contracts: ReturnType<typeof blockchainService.getContracts>;

  constructor() {
    this.currentBlock = config.startBlock;
    this.contracts = blockchainService.getContracts();
  }

  /**
   * Start listening to events
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Event listener is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting event listener', { startBlock: this.currentBlock });

    // Get current block if startBlock is 0
    if (this.currentBlock === 0) {
      this.currentBlock = await blockchainService.getCurrentBlock();
      logger.info('Starting from current block', { block: this.currentBlock });
    }

    // Start listening
    await this.listenToEvents();
  }

  /**
   * Stop listening to events
   */
  stop() {
    this.isRunning = false;
    logger.info('Event listener stopped');
  }

  /**
   * Main event listening loop
   */
  private async listenToEvents() {
    while (this.isRunning) {
      try {
        const latestBlock = await blockchainService.getCurrentBlock();
        
        // Process blocks in batches
        const batchSize = 1000;
        const endBlock = Math.min(this.currentBlock + batchSize, latestBlock);

        if (this.currentBlock <= latestBlock) {
          logger.info('Processing blocks', {
            from: this.currentBlock,
            to: endBlock,
            latest: latestBlock,
          });

          await this.processBlockRange(this.currentBlock, endBlock);
          this.currentBlock = endBlock + 1;
        } else {
          // Wait for new blocks
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        logger.error('Error in event listener loop', { error });
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Process a range of blocks
   */
  private async processBlockRange(fromBlock: number, toBlock: number) {
    const { projectFactory, taskManager, stakeVault, contributionNft } = this.contracts;

    // Listen to all events from all contracts
    const filters = [
      // ProjectFactory events
      projectFactory.filters.ProjectCreated(),
      projectFactory.filters.MemberJoined(),
      projectFactory.filters.ProjectFinalized(),
      projectFactory.filters.ProjectCancelled(),
      
      // TaskManager events
      taskManager.filters.TaskCreated(),
      taskManager.filters.ProofSubmitted(),
      taskManager.filters.TaskStatusUpdated(),
      taskManager.filters.TaskReviewed(),
      
      // StakeVault events
      stakeVault.filters.StakeDeposited(),
      stakeVault.filters.StakeReleased(),
      stakeVault.filters.StakeSlashed(),
      
      // ContributionNFT events
      contributionNft.filters.ContributionNFTMinted(),
    ];

    for (const filter of filters) {
      try {
        const events = await filter.getLogs({ fromBlock, toBlock });
        for (const event of events) {
          await this.processEvent(event);
        }
      } catch (error) {
        logger.error('Error fetching events', { filter: filter.toString(), error });
      }
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: ethers.Log) {
    try {
      // Check if event already processed
      const existing = await prisma.blockchainEvent.findUnique({
        where: {
          transactionHash_logIndex: {
            transactionHash: event.transactionHash,
            logIndex: event.index,
          },
        },
      });

      if (existing) {
        return; // Already processed
      }

      // Parse event
      const parsedEvent = await this.parseEvent(event);
      if (!parsedEvent) {
        return;
      }

      // Store event in database
      await prisma.blockchainEvent.create({
        data: {
          eventName: parsedEvent.name,
          contractAddress: event.address,
          transactionHash: event.transactionHash,
          blockNumber: BigInt(event.blockNumber),
          logIndex: event.index,
          projectId: parsedEvent.projectId ? BigInt(parsedEvent.projectId) : null,
          taskId: parsedEvent.taskId ? BigInt(parsedEvent.taskId) : null,
          userAddress: parsedEvent.userAddress || null,
          eventData: parsedEvent.data,
          processed: false,
        },
      });

      // Process event to update database state
      await this.handleEvent(parsedEvent);

      // Mark as processed
      await prisma.blockchainEvent.updateMany({
        where: {
          transactionHash: event.transactionHash,
          logIndex: event.index,
        },
        data: {
          processed: true,
        },
      });

      logger.debug('Event processed', {
        name: parsedEvent.name,
        txHash: event.transactionHash,
      });
    } catch (error) {
      logger.error('Error processing event', {
        txHash: event.transactionHash,
        logIndex: event.index,
        error,
      });
    }
  }

  /**
   * Parse event from log
   */
  private async parseEvent(event: ethers.Log): Promise<any> {
    const { projectFactory, taskManager, stakeVault, contributionNft } = this.contracts;

    try {
      // Try to parse with each contract
      const contracts = [
        { contract: projectFactory, name: 'ProjectFactory' },
        { contract: taskManager, name: 'TaskManager' },
        { contract: stakeVault, name: 'StakeVault' },
        { contract: contributionNft, name: 'ContributionNFT' },
      ];

      for (const { contract, name } of contracts) {
        try {
          const parsed = contract.interface.parseLog({
            topics: event.topics as string[],
            data: event.data,
          });

          if (parsed) {
            return {
              name: parsed.name,
              args: parsed.args,
              contract: name,
              data: {
                ...parsed.args,
              },
            };
          }
        } catch {
          // Try next contract
        }
      }
    } catch (error) {
      logger.error('Error parsing event', { error });
    }

    return null;
  }

  /**
   * Handle specific events to update database state
   */
  private async handleEvent(parsedEvent: any) {
    const { name, args, data } = parsedEvent;

    try {
      switch (name) {
        case 'ProjectCreated':
          await this.handleProjectCreated(args);
          break;

        case 'MemberJoined':
          await this.handleMemberJoined(args);
          break;

        case 'ProjectFinalized':
          await this.handleProjectFinalized(args);
          break;

        case 'TaskCreated':
          await this.handleTaskCreated(args);
          break;

        case 'ProofSubmitted':
          await this.handleProofSubmitted(args);
          break;

        case 'TaskReviewed':
          await this.handleTaskReviewed(args);
          break;

        case 'StakeDeposited':
          await this.handleStakeDeposited(args);
          break;

        case 'StakeReleased':
          await this.handleStakeReleased(args);
          break;

        case 'StakeSlashed':
          await this.handleStakeSlashed(args);
          break;

        case 'ContributionNFTMinted':
          await this.handleNFTMinted(args);
          break;

        default:
          logger.debug('Unhandled event', { name });
      }
    } catch (error) {
      logger.error('Error handling event', { name, error });
    }
  }

  // Event handlers

  private async handleProjectCreated(args: any) {
    const projectId = BigInt(args.projectId.toString());
    const block = await blockchainService.getBlock(args.timestamp || Date.now());

    await prisma.project.upsert({
      where: { projectId },
      create: {
        projectId,
        ownerAddress: args.owner,
        name: args.name,
        stakeAmount: args.stakeAmount.toString(),
        status: 'active',
        createdAt: new Date((args.timestamp || Date.now()) * 1000),
        createdAtBlock: BigInt(block?.number || 0),
      },
      update: {
        name: args.name,
        stakeAmount: args.stakeAmount.toString(),
      },
    });

    logger.info('Project created', { projectId: projectId.toString() });
  }

  private async handleMemberJoined(args: any) {
    const projectId = BigInt(args.projectId.toString());

    await prisma.projectMember.upsert({
      where: {
        projectId_memberAddress: {
          projectId,
          memberAddress: args.member,
        },
      },
      create: {
        projectId,
        memberAddress: args.member,
        stakedAmount: args.stakedAmount.toString(),
        status: 'staked',
        joinedAt: new Date((args.timestamp || Date.now()) * 1000),
      },
      update: {
        stakedAmount: args.stakedAmount.toString(),
        status: 'staked',
      },
    });

    // Update project member count
    await prisma.project.update({
      where: { projectId },
      data: {
        memberCount: { increment: 1 },
        totalStaked: {
          increment: args.stakedAmount.toString(),
        },
      },
    });

    logger.info('Member joined', {
      projectId: projectId.toString(),
      member: args.member,
    });
  }

  private async handleProjectFinalized(args: any) {
    const projectId = BigInt(args.projectId.toString());

    await prisma.project.update({
      where: { projectId },
      data: {
        status: 'finalized',
        finalizedAt: new Date(),
      },
    });

    logger.info('Project finalized', { projectId: projectId.toString() });
  }

  private async handleTaskCreated(args: any) {
    const taskId = BigInt(args.taskId.toString());
    const projectId = BigInt(args.projectId.toString());

    await prisma.task.create({
      data: {
        taskId,
        projectId,
        assigneeAddress: args.assignee,
        title: args.title,
        status: 'pending',
        createdAt: new Date((args.timestamp || Date.now()) * 1000),
      },
    });

    logger.info('Task created', {
      taskId: taskId.toString(),
      projectId: projectId.toString(),
    });
  }

  private async handleProofSubmitted(args: any) {
    const taskId = BigInt(args.taskId.toString());

    await prisma.task.update({
      where: { taskId },
      data: {
        proofCid: args.proofCID,
        status: 'submitted',
        submittedAt: new Date((args.timestamp || Date.now()) * 1000),
      },
    });

    logger.info('Proof submitted', { taskId: taskId.toString() });
  }

  private async handleTaskReviewed(args: any) {
    const taskId = BigInt(args.taskId.toString());
    const approved = args.approved;

    await prisma.task.update({
      where: { taskId },
      data: {
        status: approved ? 'approved' : 'rejected',
        reviewedAt: new Date((args.timestamp || Date.now()) * 1000),
        reviewerAddress: args.reviewer,
      },
    });

    logger.info('Task reviewed', {
      taskId: taskId.toString(),
      approved,
    });
  }

  private async handleStakeDeposited(args: any) {
    // Already handled in MemberJoined
    logger.debug('Stake deposited', { args });
  }

  private async handleStakeReleased(args: any) {
    const projectId = BigInt(args.projectId.toString());

    await prisma.projectMember.updateMany({
      where: {
        projectId,
        memberAddress: args.member,
      },
      data: {
        status: 'returned',
      },
    });

    logger.info('Stake released', {
      projectId: projectId.toString(),
      member: args.member,
    });
  }

  private async handleStakeSlashed(args: any) {
    const projectId = BigInt(args.projectId.toString());

    await prisma.projectMember.updateMany({
      where: {
        projectId,
        memberAddress: args.member,
      },
      data: {
        status: 'slashed',
      },
    });

    await prisma.project.update({
      where: { projectId },
      data: {
        totalSlashed: {
          increment: args.amount.toString(),
        },
      },
    });

    logger.info('Stake slashed', {
      projectId: projectId.toString(),
      member: args.member,
    });
  }

  private async handleNFTMinted(args: any) {
    const tokenId = BigInt(args.tokenId.toString());
    const projectId = BigInt(args.projectId.toString());
    const taskId = BigInt(args.taskId.toString());

    await prisma.contributionNFT.create({
      data: {
        tokenId,
        projectId,
        taskId,
        contributorAddress: args.contributor,
        proofCid: args.proofCID,
        mintedAt: new Date((args.timestamp || Date.now()) * 1000),
      },
    });

    // Update member stats
    const task = await prisma.task.findUnique({
      where: { taskId },
    });

    if (task) {
      await prisma.projectMember.updateMany({
        where: {
          projectId,
          memberAddress: task.assigneeAddress,
        },
        data: {
          tasksCompleted: { increment: 1 },
        },
      });
    }

    logger.info('NFT minted', {
      tokenId: tokenId.toString(),
      projectId: projectId.toString(),
    });
  }
}

// Export singleton instance
export const eventListener = new EventListenerService();

// If running as script, start the listener
if (require.main === module) {
  eventListener
    .start()
    .then(() => {
      logger.info('Event listener started successfully');
    })
    .catch((error) => {
      logger.error('Failed to start event listener', { error });
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down event listener...');
    eventListener.stop();
    process.exit(0);
  });
}

