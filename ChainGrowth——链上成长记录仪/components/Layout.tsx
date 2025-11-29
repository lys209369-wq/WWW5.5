import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: '待办 & 日历', icon: '📅' },
    { id: 'review', label: 'AI 周总结', icon: '🤖' },
    { id: 'badges', label: '勋章墙 (NFT)', icon: '🎖️' },
  ];

  return (
    <div className="min-h-screen flex bg-web3-dark text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-web3-card border-r border-slate-700 flex flex-col items-center md:items-start p-4 fixed h-full z-10 transition-all">
        <div className="mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-web3-primary to-web3-accent flex items-center justify-center font-bold text-white">
            C
          </div>
          <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-web3-primary to-purple-400">
            ChainGrowth
          </span>
        </div>

        <nav className="flex-1 w-full space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-web3-primary/20 text-web3-primary border border-web3-primary/30'
                  : 'hover:bg-slate-700/50 text-slate-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-700 w-full">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-600 animate-pulse"></div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-200">0x123...abc</p>
              <p className="text-xs text-green-400">Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};