import React, { useState, useEffect, useRef } from 'react';
import { Pet, GrowthStage, Species } from '../types';
import { GAME_RULES, SPECIES_LIST } from '../constants';
import { Button } from './Button';
import { Heart, Utensils, Sparkles, MessageCircle, X, Zap, Activity, Smile, ChevronUp } from 'lucide-react';
import { generateSpiritResponse } from '../services/geminiService';
import { ToastType } from './Toast';

interface PetInteractionProps {
  pet: Pet;
  onUpdatePet: (updatedPet: Pet) => void;
  onClose: () => void;
  onNotify: (msg: string, type: ToastType) => void;
}

export const PetInteraction: React.FC<PetInteractionProps> = ({ pet, onUpdatePet, onClose, onNotify }) => {
  const species = SPECIES_LIST.find(s => s.id === pet.speciesId);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of content when chat updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, isChatting]);

  // Helper to calculate cooldown progress
  const getCooldown = (lastTime: number, cooldownMs: number) => {
    const now = Date.now();
    const elapsed = now - lastTime;
    const remaining = Math.max(0, cooldownMs - elapsed);
    return {
      ready: remaining === 0,
      percent: Math.min(100, (elapsed / cooldownMs) * 100),
      remainingSec: Math.ceil(remaining / 1000)
    };
  };

  const [timers, setTimers] = useState({
    feed: getCooldown(pet.metadata.lastFedAt, GAME_RULES.feed.cooldownMs),
    pet: getCooldown(pet.metadata.lastPettedAt, GAME_RULES.pet.cooldownMs),
    clean: getCooldown(pet.metadata.lastCleanedAt, GAME_RULES.clean.cooldownMs),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers({
        feed: getCooldown(pet.metadata.lastFedAt, GAME_RULES.feed.cooldownMs),
        pet: getCooldown(pet.metadata.lastPettedAt, GAME_RULES.pet.cooldownMs),
        clean: getCooldown(pet.metadata.lastCleanedAt, GAME_RULES.clean.cooldownMs),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pet]);

  const handleAction = (type: 'feed' | 'pet' | 'clean') => {
    const now = Date.now();
    let newMeta = { ...pet.metadata };
    
    if (type === 'feed') {
      newMeta.saturation += GAME_RULES.feed.satMod;
      newMeta.lastFedAt = now;
      onNotify('Yummy! Saturation increased.', 'success');
    } else if (type === 'pet') {
      newMeta.intimacy += GAME_RULES.pet.intMod;
      newMeta.lastPettedAt = now;
      onNotify('She feels loved! Intimacy increased.', 'success');
    } else if (type === 'clean') {
      newMeta.health += GAME_RULES.clean.healthMod;
      newMeta.lastCleanedAt = now;
      onNotify('Sparkling clean! Health restored.', 'success');
    }

    // Immediately update local timers to force button disable state without waiting for prop roundtrip
    const updatedTimers = { ...timers };
    if (type === 'feed') updatedTimers.feed = getCooldown(now, GAME_RULES.feed.cooldownMs);
    if (type === 'pet') updatedTimers.pet = getCooldown(now, GAME_RULES.pet.cooldownMs);
    if (type === 'clean') updatedTimers.clean = getCooldown(now, GAME_RULES.clean.cooldownMs);
    setTimers(updatedTimers);

    // Check Evolution
    let newStage = pet.stage;
    const stats = [newMeta.saturation, newMeta.intimacy, newMeta.health];
    const minStat = Math.min(...stats);

    if (pet.stage === GrowthStage.JUVENILE && minStat >= GAME_RULES.thresholds[GrowthStage.ADULT]) {
      newStage = GrowthStage.ADULT;
      onNotify(`🎉 LEVEL UP! ${pet.name} is now an Adult!`, 'success');
    } else if (pet.stage === GrowthStage.ADULT && minStat >= GAME_RULES.thresholds[GrowthStage.BREEDING]) {
      newStage = GrowthStage.BREEDING;
      onNotify(`🥚 BREEDING UNLOCKED! Platform species count +2!`, 'success');
    } else if (pet.stage === GrowthStage.BREEDING && minStat >= GAME_RULES.thresholds[GrowthStage.RE_BREEDING]) {
      newStage = GrowthStage.RE_BREEDING;
      onNotify(`👑 MATRIARCH STATUS! Species count +2!`, 'success');
    }

    onUpdatePet({
      ...pet,
      metadata: newMeta,
      stage: newStage
    });
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !species) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    const reply = await generateSpiritResponse(species, userMsg, pet.stage);
    
    setChatHistory(prev => [...prev, { role: 'bot', text: reply }]);
    setIsChatting(false);
  };

  if (!species) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-white overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Floating Close Button - Fixed relative to container */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-game hover:scale-105 transition-transform z-20 text-gray-800">
            <X size={24} strokeWidth={3} />
        </button>

        {/* Scrollable Content Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative bg-white">
          
          {/* Decorative Header Background */}
          <div className={`h-32 ${species.color.replace('bg-', 'bg-').replace('100', '200')} relative overflow-hidden shrink-0`}>
             <div className="absolute inset-0 bg-white/20" style={{backgroundImage: 'radial-gradient(white 20%, transparent 20%)', backgroundSize: '20px 20px', opacity: 0.5}}></div>
          </div>

          {/* Pet Avatar - Floating Effect */}
          <div className="relative px-6 -mt-16 flex flex-col items-center shrink-0">
            <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-xl rotate-3 transform transition hover:rotate-0 hover:scale-105 duration-300">
               <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-gray-100 border-2 border-gray-100">
                 <img src={species.image} alt={pet.name} className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">{pet.name}</h2>
              <div className="inline-block mt-1 px-4 py-1 bg-gray-800 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                {pet.stage}
              </div>
            </div>
          </div>

          {/* Game Stats Bars */}
          <div className="px-8 py-6 space-y-3 shrink-0">
             <StatBar 
               icon={<Utensils size={14} />} 
               label="HUNGER" 
               value={pet.metadata.saturation} 
               color="bg-orange-400" 
               bg="bg-orange-100"
             />
             <StatBar 
               icon={<Smile size={14} />} 
               label="LOVE" 
               value={pet.metadata.intimacy} 
               color="bg-pink-400" 
               bg="bg-pink-100"
             />
             <StatBar 
               icon={<Activity size={14} />} 
               label="HEALTH" 
               value={pet.metadata.health} 
               color="bg-emerald-400" 
               bg="bg-emerald-100"
             />
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-3 gap-3 px-6 pb-6 shrink-0">
            <ActionBtn 
              icon={<Utensils size={28} />} 
              label="FEED" 
              ready={timers.feed.ready} 
              timer={timers.feed.remainingSec}
              onClick={() => handleAction('feed')}
              variant="accent"
            />
            <ActionBtn 
              icon={<Heart size={28} />} 
              label="PET" 
              ready={timers.pet.ready} 
              timer={timers.pet.remainingSec}
              onClick={() => handleAction('pet')}
              variant="primary"
            />
            <ActionBtn 
              icon={<Sparkles size={28} />} 
              label="CLEAN" 
              ready={timers.clean.ready} 
              timer={timers.clean.remainingSec}
              onClick={() => handleAction('clean')}
              variant="secondary"
            />
          </div>

          {/* Scroll Hint */}
          <div className="flex justify-center -mt-2 pb-2 opacity-30 animate-bounce">
              <ChevronUp size={20} />
          </div>

          {/* Chat / Lore Section */}
          <div className="px-2 pb-2">
            <div className="bg-gray-50 border-4 border-gray-100 rounded-[2rem] shadow-inner flex flex-col">
              <div className="p-3 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest justify-center">
                <MessageCircle size={14} /> Spirit Connection
              </div>
              
              <div className="p-4 space-y-3 min-h-[150px]">
                 {chatHistory.length === 0 && (
                   <div className="text-center p-4">
                     <p className="text-gray-400 text-sm font-medium">✨ Connect with the ancient spirit...</p>
                   </div>
                 )}
                 {chatHistory.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium ${
                       msg.role === 'user' 
                         ? 'bg-gray-800 text-white rounded-br-none shadow-md' 
                         : 'bg-white text-gray-700 border-2 border-gray-100 rounded-bl-none shadow-sm'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {isChatting && <div className="text-center text-xs font-bold text-violet-400 animate-pulse">Spirit is thinking...</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0 z-10">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-violet-100 transition-all placeholder:text-gray-300 placeholder:font-medium"
              placeholder="Say hello..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            />
            <button 
              onClick={handleChat} 
              disabled={isChatting}
              className="bg-gray-800 text-white p-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50"
            >
              <Zap size={20} fill="currentColor" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatBar = ({ icon, label, value, color, bg }: any) => (
  <div className="flex items-center gap-3">
    <div className={`p-1.5 rounded-lg ${bg} ${color.replace('bg-', 'text-')}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1 tracking-wider">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100">
        <div 
          className={`h-full ${color} transition-all duration-500 rounded-full`} 
          style={{ width: `${Math.min(100, value)}%` }}
        >
          {/* Shine effect on bar */}
          <div className="w-full h-[50%] bg-white/30 rounded-t-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const ActionBtn = ({ icon, label, ready, timer, onClick, variant }: any) => {
  const styles: {[key: string]: string} = {
    primary: "bg-[#8B5CF6] text-white border-b-4 border-[#6D28D9]",
    secondary: "bg-[#4ECDC4] text-white border-b-4 border-[#2EAFA6]",
    accent: "bg-[#FFE66D] text-gray-800 border-b-4 border-[#E6C840]",
    disabled: "bg-gray-200 text-gray-400 border-b-4 border-gray-300 cursor-not-allowed"
  };

  return (
    <button 
      onClick={onClick}
      disabled={!ready}
      className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-100 active:border-b-0 active:translate-y-1 ${
        ready ? styles[variant] : styles.disabled
      }`}
    >
      <div className="mb-1">{icon}</div>
      <div className="font-black text-[10px] uppercase tracking-wide">{label}</div>
      {!ready && <div className="text-[10px] font-mono mt-0.5 opacity-80">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>}
    </button>
  );
};