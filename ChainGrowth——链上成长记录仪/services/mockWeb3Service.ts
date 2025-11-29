import { Task, TaskCategory, WeeklySummary, Badge } from '../types';
import { INITIAL_BADGES } from '../constants';

// Simulating a delay to mimic blockchain transaction time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a fake transaction hash
const fakeTxHash = () => '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

class MockWeb3Service {
  private tasks: Task[] = [];
  private summaries: WeeklySummary[] = [];
  private badges: Badge[] = [...INITIAL_BADGES];

  constructor() {
    // Seed some initial data
    this.tasks = [
      { id: '1', title: 'Deploy Solidity Contract', category: TaskCategory.WORK, date: new Date().toISOString().split('T')[0], completed: true, txHash: fakeTxHash() },
      { id: '2', title: 'Read "The Infinite Machine"', category: TaskCategory.LEARNING, date: new Date().toISOString().split('T')[0], completed: false },
      { id: '3', title: 'Morning Jog (5km)', category: TaskCategory.HEALTH, date: new Date().toISOString().split('T')[0], completed: false },
    ];
    this.checkBadges();
  }

  async getTasks(): Promise<Task[]> {
    await delay(300);
    return [...this.tasks];
  }

  async createTask(title: string, category: TaskCategory, date: string): Promise<Task> {
    await delay(1500); // Simulate block time
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      date,
      completed: false,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async completeTask(taskId: string): Promise<string> {
    await delay(2000); // Simulate transaction
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      task.txHash = fakeTxHash();
      this.checkBadges();
      return task.txHash;
    }
    throw new Error("Task not found");
  }

  async saveSummary(summary: Omit<WeeklySummary, 'id' | 'createdAt' | 'txHash'>): Promise<WeeklySummary> {
    await delay(2500); // Simulate IPFS upload + Smart Contract call
    const newSummary: WeeklySummary = {
      ...summary,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      txHash: fakeTxHash(),
    };
    this.summaries.push(newSummary);
    this.checkBadges();
    return newSummary;
  }

  async getSummaries(): Promise<WeeklySummary[]> {
    await delay(500);
    return [...this.summaries];
  }

  async getBadges(): Promise<Badge[]> {
    await delay(500);
    return [...this.badges];
  }

  // Logic to simulate Smart Contract "checkBadgeUnlock"
  private checkBadges() {
    const completedTasks = this.tasks.filter(t => t.completed);
    const totalCompleted = completedTasks.length;
    const learningCompleted = completedTasks.filter(t => t.category === TaskCategory.LEARNING).length;

    // K1: Seeker
    if (learningCompleted >= 5) this.unlockBadge('k1');
    
    // K2: Deep Diver (Simulate just > 3 for demo)
    if (totalCompleted >= 3) this.unlockBadge('k2');

    // K3: Explorer (At least 1 in each)
    const categories = new Set(completedTasks.map(t => t.category));
    if (categories.size >= 3) this.unlockBadge('k3');

    // K4: Lighthouse (Summaries count)
    if (this.summaries.length >= 1) this.unlockBadge('k4'); // Simplified for demo
  }

  private unlockBadge(badgeId: string) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      badge.unlockedAt = new Date().toISOString();
      badge.tokenId = Math.floor(Math.random() * 10000).toString();
      console.log(`Badge Unlocked: ${badge.name}`);
    }
  }
}

export const web3Service = new MockWeb3Service();