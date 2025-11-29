import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskCategory, Badge } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { web3Service } from '../services/mockWeb3Service';

interface CalendarViewProps {
  tasks: Task[];
  badges: Badge[];
  onTaskUpdate: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, badges, onTaskUpdate }) => {
  // State for Navigation and Selection
  const [viewDate, setViewDate] = useState(new Date()); // The month we are looking at
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // The specific date selected
  
  // State for Task Creation
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>(TaskCategory.WORK);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Badge Animation
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const prevBadgesRef = useRef<Badge[]>([]);

  // Effect: Detect Badge Unlocks
  useEffect(() => {
    if (prevBadgesRef.current.length > 0) {
      const previouslyUnlockedIds = new Set(prevBadgesRef.current.filter(b => b.unlocked).map(b => b.id));
      const newUnlock = badges.find(b => b.unlocked && !previouslyUnlockedIds.has(b.id));
      
      if (newUnlock) {
        setNewlyUnlockedBadge(newUnlock);
      }
    }
    prevBadgesRef.current = badges;
  }, [badges]);

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

  const generateCalendarGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    // Padding for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(newDate);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    setIsSubmitting(true);
    await web3Service.createTask(newTaskTitle, newTaskCategory, selectedDate);
    setNewTaskTitle('');
    setIsSubmitting(false);
    onTaskUpdate();
  };

  const handleComplete = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      await web3Service.completeTask(taskId);
      onTaskUpdate();
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const tasksForSelectedDate = tasks.filter(t => t.date === selectedDate);
  const calendarGrid = generateCalendarGrid();
  const currentMonthName = viewDate.toLocaleString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full relative">
      
      {/* Badge Unlock Overlay */}
      {newlyUnlockedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-web3-card p-8 rounded-3xl border-2 border-web3-primary shadow-[0_0_50px_rgba(99,102,241,0.5)] flex flex-col items-center text-center max-w-sm mx-4 relative overflow-hidden">
            {/* Confetti Background Effect (CSS) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent animate-pulse"></div>
            
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
              勋章解锁!
            </h2>
            
            <div className="w-32 h-32 my-6 relative group">
              <div className="absolute inset-0 bg-web3-primary/30 rounded-full blur-xl animate-pulse"></div>
              <img 
                src={newlyUnlockedBadge.imageUrl} 
                alt={newlyUnlockedBadge.name} 
                className="w-full h-full rounded-full object-cover border-4 border-yellow-400 shadow-2xl relative z-10"
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{newlyUnlockedBadge.name}</h3>
            <p className="text-slate-300 text-sm mb-6">{newlyUnlockedBadge.description}</p>
            
            <button 
              onClick={() => setNewlyUnlockedBadge(null)}
              className="bg-web3-primary hover:bg-web3-accent text-white font-bold py-2 px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              太棒了！收下荣誉
            </button>
          </div>
        </div>
      )}

      {/* Left: Calendar Grid */}
      <div className="lg:col-span-2 bg-web3-card rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
             <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">◀</button>
             <h2 className="text-2xl font-bold text-white min-w-[140px] text-center">{currentMonthName}</h2>
             <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">▶</button>
          </div>
          <div className="flex gap-2">
             <span className="text-xs text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-web3-success"></span> 完成</span>
             <span className="text-xs text-slate-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span> 待办</span>
          </div>
        </header>
        
        <div className="grid grid-cols-7 gap-3 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-slate-500 font-medium text-sm">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3 flex-1">
          {calendarGrid.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-transparent"></div>;

            const dayTasks = tasks.filter(t => t.date === date);
            const isToday = date === new Date().toISOString().split('T')[0];
            const isSelected = date === selectedDate;
            const hasCompleted = dayTasks.some(t => t.completed);
            const hasPending = dayTasks.some(t => !t.completed);

            return (
              <div 
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`
                  min-h-[60px] md:min-h-[80px] rounded-xl border transition-all cursor-pointer relative overflow-hidden group flex flex-col items-center justify-start pt-2
                  ${isSelected ? 'border-web3-primary bg-web3-primary/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}
                  ${isToday ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-web3-card' : ''}
                `}
              >
                <div className={`text-sm font-semibold z-10 ${isSelected ? 'text-web3-primary' : 'text-slate-400'}`}>
                  {date.split('-')[2]}
                </div>
                
                {/* Visual Indicators */}
                <div className="mt-2 flex gap-1 flex-wrap justify-center px-1">
                   {hasCompleted && <div className="w-1.5 h-1.5 rounded-full bg-web3-success shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
                   {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>}
                </div>

                {/* Task Count on Hover */}
                {dayTasks.length > 0 && (
                   <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-[10px] text-center text-slate-300 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                     {dayTasks.filter(t=>t.completed).length}/{dayTasks.length}
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Task List */}
      <div className="bg-web3-card rounded-2xl p-6 border border-slate-700 flex flex-col h-[600px] lg:h-auto shadow-xl">
        <h3 className="text-xl font-bold mb-1">
           {new Date(selectedDate).toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <p className="text-slate-400 text-sm mb-6">待办事项清单</p>

        {/* Create Task Input */}
        <form onSubmit={handleCreateTask} className="mb-6 space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <input 
            type="text" 
            placeholder="输入新任务..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-web3-primary text-white placeholder-slate-500"
          />
          
          <div className="flex gap-2">
            {/* Date Picker for Flexibility */}
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                if(newDate) {
                  setSelectedDate(newDate);
                  // Also jump calendar view to that month
                  setViewDate(new Date(newDate));
                }
              }}
              className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-sm text-slate-300 focus:outline-none w-32" 
            />
            
            <select 
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-sm text-slate-300 focus:outline-none flex-1"
            >
              {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !newTaskTitle}
            className="w-full bg-web3-primary hover:bg-web3-accent disabled:opacity-50 text-white font-medium rounded-lg py-2 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>+</span> 添加至该日
              </>
            )}
          </button>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <p>暂无任务</p>
              <p className="text-xs mt-2">在上方规划您的成长足迹</p>
            </div>
          ) : (
            tasksForSelectedDate.map(task => (
              <div 
                key={task.id} 
                className={`p-3 rounded-xl border flex items-center justify-between group transition-all duration-300 ${
                  task.completed 
                    ? 'bg-slate-800/50 border-slate-700 opacity-60' 
                    : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => !task.completed && handleComplete(task.id)}
                    disabled={task.completed || isSubmitting}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-web3-success border-web3-success text-white scale-110' 
                        : 'border-slate-500 hover:border-web3-primary hover:scale-110'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>
                  <div>
                    <p className={`font-medium text-sm transition-colors ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[task.category]}`}>
                        {task.category}
                      </span>
                      {task.txHash && (
                        <span className="text-[10px] text-web3-success font-mono cursor-help flex items-center gap-1" title={`Tx: ${task.txHash}`}>
                          <span>🔗</span> On-Chain
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};