export interface Project {
  id: string;
  name: string;
  description: string;
  stakeAmount: number;
  currency: string;
  owner: string;
  status: 'active' | 'completed' | 'pending';
  membersCount: number;
  tasksCount: number;
  completedTasks: number;
  createdAt: string;
  vaultBalance: number;
}

export interface Member {
  id: string;
  address: string;
  displayName: string;
  avatar: string;
  stakeStatus: 'staked' | 'pending' | 'returned' | 'slashed';
  stakeAmount: number;
  tasksCompleted: number;
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  proofCid?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reward: number;
}

export interface OnChainEvent {
  id: string;
  type: 'stake_deposit' | 'task_submit' | 'task_approve' | 'task_reject' | 'nft_mint' | 'stake_return' | 'project_create';
  txHash: string;
  timestamp: string;
  description: string;
  actor: string;
}

export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    name: 'DeFi Dashboard Hackathon',
    description: 'Build a comprehensive DeFi analytics dashboard with real-time data from multiple protocols.',
    stakeAmount: 0.1,
    currency: 'ETH',
    owner: '0x1234...5678',
    status: 'active',
    membersCount: 5,
    tasksCount: 8,
    completedTasks: 3,
    createdAt: '2024-01-15',
    vaultBalance: 0.5,
  },
  {
    id: 'proj_002',
    name: 'NFT Marketplace V2',
    description: 'Upgrade the existing marketplace with batch transfers and lazy minting features.',
    stakeAmount: 0.25,
    currency: 'ETH',
    owner: '0xabcd...ef01',
    status: 'active',
    membersCount: 3,
    tasksCount: 5,
    completedTasks: 2,
    createdAt: '2024-01-20',
    vaultBalance: 0.75,
  },
  {
    id: 'proj_003',
    name: 'DAO Governance Module',
    description: 'Implement quadratic voting and delegation features for the governance system.',
    stakeAmount: 0.15,
    currency: 'ETH',
    owner: '0x9876...5432',
    status: 'completed',
    membersCount: 4,
    tasksCount: 6,
    completedTasks: 6,
    createdAt: '2024-01-01',
    vaultBalance: 0,
  },
];

export const mockMembers: Member[] = [
  {
    id: 'mem_001',
    address: '0x1234...5678',
    displayName: 'alice.eth',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alice',
    stakeStatus: 'staked',
    stakeAmount: 0.1,
    tasksCompleted: 2,
    joinedAt: '2024-01-15',
  },
  {
    id: 'mem_002',
    address: '0xabcd...ef01',
    displayName: 'bob.eth',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=bob',
    stakeStatus: 'staked',
    stakeAmount: 0.1,
    tasksCompleted: 1,
    joinedAt: '2024-01-16',
  },
  {
    id: 'mem_003',
    address: '0x9876...5432',
    displayName: 'carol.eth',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=carol',
    stakeStatus: 'staked',
    stakeAmount: 0.1,
    tasksCompleted: 0,
    joinedAt: '2024-01-17',
  },
  {
    id: 'mem_004',
    address: '0xfedc...ba98',
    displayName: 'dave.eth',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dave',
    stakeStatus: 'returned',
    stakeAmount: 0.1,
    tasksCompleted: 3,
    joinedAt: '2024-01-18',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task_001',
    title: 'Design System Setup',
    description: 'Create the base component library with Tailwind and shadcn/ui',
    assignee: 'alice.eth',
    status: 'approved',
    proofCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    submittedAt: '2024-01-18',
    reviewedAt: '2024-01-19',
    reward: 0.05,
  },
  {
    id: 'task_002',
    title: 'Smart Contract Integration',
    description: 'Connect frontend to Project and StakeVault contracts',
    assignee: 'bob.eth',
    status: 'under_review',
    proofCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    submittedAt: '2024-01-20',
    reward: 0.08,
  },
  {
    id: 'task_003',
    title: 'IPFS Upload Module',
    description: 'Implement file upload to IPFS with progress tracking',
    assignee: 'carol.eth',
    status: 'submitted',
    proofCid: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
    submittedAt: '2024-01-21',
    reward: 0.03,
  },
  {
    id: 'task_004',
    title: 'Wallet Connection',
    description: 'Add WalletConnect and MetaMask support',
    assignee: 'alice.eth',
    status: 'approved',
    proofCid: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
    submittedAt: '2024-01-17',
    reviewedAt: '2024-01-18',
    reward: 0.04,
  },
  {
    id: 'task_005',
    title: 'Dashboard Analytics',
    description: 'Build charts and metrics for project overview',
    assignee: 'bob.eth',
    status: 'pending',
    reward: 0.06,
  },
  {
    id: 'task_006',
    title: 'NFT Minting Logic',
    description: 'Implement contribution NFT minting on task approval',
    assignee: 'carol.eth',
    status: 'pending',
    reward: 0.07,
  },
];

export const mockEvents: OnChainEvent[] = [
  {
    id: 'evt_001',
    type: 'project_create',
    txHash: '0x8a7d...3f2e',
    timestamp: '2024-01-15 10:30:00',
    description: 'Project "DeFi Dashboard Hackathon" created',
    actor: '0x1234...5678',
  },
  {
    id: 'evt_002',
    type: 'stake_deposit',
    txHash: '0x2b4c...9d1a',
    timestamp: '2024-01-15 11:00:00',
    description: 'alice.eth deposited 0.1 ETH stake',
    actor: 'alice.eth',
  },
  {
    id: 'evt_003',
    type: 'stake_deposit',
    txHash: '0x7e3f...4a2b',
    timestamp: '2024-01-16 09:15:00',
    description: 'bob.eth deposited 0.1 ETH stake',
    actor: 'bob.eth',
  },
  {
    id: 'evt_004',
    type: 'task_submit',
    txHash: '0x1c9d...8e5f',
    timestamp: '2024-01-18 14:20:00',
    description: 'Task "Design System Setup" proof submitted',
    actor: 'alice.eth',
  },
  {
    id: 'evt_005',
    type: 'task_approve',
    txHash: '0x5f2a...7c3d',
    timestamp: '2024-01-19 10:00:00',
    description: 'Task "Design System Setup" approved',
    actor: '0x1234...5678',
  },
  {
    id: 'evt_006',
    type: 'nft_mint',
    txHash: '0x3d8e...2b1c',
    timestamp: '2024-01-19 10:00:05',
    description: 'Contribution NFT #001 minted to alice.eth',
    actor: 'TaskNFT Contract',
  },
  {
    id: 'evt_007',
    type: 'task_submit',
    txHash: '0x9a4b...6e2f',
    timestamp: '2024-01-20 16:45:00',
    description: 'Task "Smart Contract Integration" proof submitted',
    actor: 'bob.eth',
  },
];

export const currentUser = {
  address: '0x1234...5678',
  displayName: 'alice.eth',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alice',
  isConnected: true,
  balance: '2.45 ETH',
};
