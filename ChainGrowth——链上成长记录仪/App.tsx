import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CalendarView } from './components/CalendarView';
import { AIReview } from './components/AIReview';
import { BadgeGallery } from './components/BadgeGallery';
import { web3Service } from './services/mockWeb3Service';
import { Task, Badge } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch both tasks and badges to keep UI in sync
      const [fetchedTasks, fetchedBadges] = await Promise.all([
        web3Service.getTasks(),
        web3Service.getBadges()
      ]);
      setTasks(fetchedTasks);
      setBadges(fetchedBadges);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-web3-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Syncing with Blockchain...</p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="h-full animate-fade-in">
              <CalendarView 
                tasks={tasks} 
                badges={badges}
                onTaskUpdate={fetchData} 
              />
            </div>
          )}
          
          {activeTab === 'review' && (
             <div className="animate-fade-in">
               <AIReview tasks={tasks} />
             </div>
          )}

          {activeTab === 'badges' && (
            <div className="animate-fade-in">
              <BadgeGallery badges={badges} />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;