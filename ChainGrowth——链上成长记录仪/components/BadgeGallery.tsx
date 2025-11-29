import React from 'react';
import { Badge } from '../types';

interface BadgeGalleryProps {
  badges: Badge[];
}

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => (
  <div className={`
    relative group perspective-1000
  `}>
    <div className={`
      relative p-6 rounded-2xl border transition-all duration-500 transform-gpu
      flex flex-col items-center text-center h-full
      ${badge.unlocked 
        ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-web3-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:scale-105' 
        : 'bg-slate-900 border-slate-800 opacity-60 grayscale'}
    `}>
      {/* Glow effect for unlocked */}
      {badge.unlocked && (
        <div className="absolute inset-0 bg-web3-primary/10 blur-xl rounded-2xl -z-10 group-hover:bg-web3-primary/20 transition-colors"></div>
      )}

      {/* Image Placeholder */}
      <div className={`
        w-24 h-24 rounded-full mb-4 flex items-center justify-center text-4xl border-4 overflow-hidden relative
        ${badge.unlocked ? 'border-web3-accent shadow-inner bg-slate-800' : 'border-slate-700 bg-slate-800'}
      `}>
        {badge.unlocked ? (
          <>
             <div className="absolute inset-0 bg-web3-accent/20 animate-pulse z-0"></div>
             <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover rounded-full relative z-10" />
          </>
        ) : (
          <span className="text-4xl">🔒</span>
        )}
      </div>

      <h3 className={`font-bold text-lg mb-2 ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>
        {badge.name}
      </h3>
      
      <p className="text-xs text-slate-400 mb-4 flex-grow leading-relaxed">
        {badge.description}
      </p>

      <div className="mt-auto w-full pt-4 border-t border-slate-700/50">
        {badge.unlocked ? (
          <div>
            <span className="text-[10px] uppercase tracking-widest text-web3-success font-bold block mb-1">Minted NFT</span>
            <span className="text-[10px] font-mono text-slate-500">ID: #{badge.tokenId}</span>
          </div>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Locked</span>
        )}
      </div>
    </div>
  </div>
);

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ badges }) => {
  const knowledgeBadges = badges.filter(b => b.type === 'KNOWLEDGE');
  const mindsetBadges = badges.filter(b => b.type === 'MINDSET');

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">荣誉勋章墙</h2>
        <p className="text-slate-400 mb-8">您的成长资产 (Soulbound Tokens)</p>
        
        {badges.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700 border-dashed">
            <p className="text-slate-500">Loading your legacy...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                <span>📘</span> 求知星芒系列 (Knowledge)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {knowledgeBadges.map(b => <BadgeCard key={b.id} badge={b} />)}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
                <span>🧠</span> 坚韧心智系列 (Mindset)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mindsetBadges.map(b => <BadgeCard key={b.id} badge={b} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};