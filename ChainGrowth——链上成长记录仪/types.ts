export enum TaskCategory {
  LEARNING = 'Learning',
  WORK = 'Work',
  HEALTH = 'Health',
  LIFE = 'Life'
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  date: string; // ISO Date string YYYY-MM-DD
  completed: boolean;
  txHash?: string; // Blockchain Transaction Hash
}

export interface WeeklySummary {
  id: string;
  weekStartDate: string;
  keyTakeaways: string[];
  growthConnections: string;
  scenarioReview: string;
  suggestions: string;
  closingComment: string;
  createdAt: string;
  txHash?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'KNOWLEDGE' | 'MINDSET';
  unlocked: boolean;
  unlockedAt?: string;
  tokenId?: string;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  streakDays: number;
  categoryCounts: Record<TaskCategory, number>;
}