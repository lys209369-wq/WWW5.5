import { Badge, TaskCategory } from './types';

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  [TaskCategory.LEARNING]: 'bg-blue-500',
  [TaskCategory.WORK]: 'bg-purple-500',
  [TaskCategory.HEALTH]: 'bg-green-500',
  [TaskCategory.LIFE]: 'bg-orange-500',
};

export const INITIAL_BADGES: Badge[] = [
  // Knowledge Badges
  {
    id: 'k1',
    name: '求知星芒章',
    description: '完成 5 个学习类待办，点亮求知之路。',
    imageUrl: 'https://picsum.photos/id/1010/200/200', // Placeholder
    type: 'KNOWLEDGE',
    unlocked: false,
  },
  {
    id: 'k2',
    name: '深耕笃行章',
    description: '完成 20 个工作/学习任务，展现深度执行力。',
    imageUrl: 'https://picsum.photos/id/1015/200/200',
    type: 'KNOWLEDGE',
    unlocked: false,
  },
  {
    id: 'k3',
    name: '全能探索者',
    description: '在所有分类中至少完成 1 个任务。',
    imageUrl: 'https://picsum.photos/id/1016/200/200',
    type: 'KNOWLEDGE',
    unlocked: false,
  },
  {
    id: 'k4',
    name: '智识灯塔',
    description: '累计生成 4 次 AI 周总结。',
    imageUrl: 'https://picsum.photos/id/1018/200/200',
    type: 'KNOWLEDGE',
    unlocked: false,
  },
  // Mindset Badges
  {
    id: 'm1',
    name: '自律坚守章',
    description: '连续 3 天完成所有待办事项。',
    imageUrl: 'https://picsum.photos/id/1025/200/200',
    type: 'MINDSET',
    unlocked: false,
  },
  {
    id: 'm2',
    name: '抗压小勇士',
    description: '单日完成超过 8 个任务。',
    imageUrl: 'https://picsum.photos/id/1024/200/200',
    type: 'MINDSET',
    unlocked: false,
  },
  {
    id: 'm3',
    name: '平衡大师',
    description: '单周内健康与工作任务比例均衡。',
    imageUrl: 'https://picsum.photos/id/1022/200/200',
    type: 'MINDSET',
    unlocked: false,
  },
  {
    id: 'm4',
    name: '初心理念',
    description: '获得第一次 AI 对心态的正面评价。',
    imageUrl: 'https://picsum.photos/id/1021/200/200',
    type: 'MINDSET',
    unlocked: false,
  },
];