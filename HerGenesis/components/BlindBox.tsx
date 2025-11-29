import React, { useState } from 'react';
import { SPECIES_LIST } from '../constants';
import { Species } from '../types';
import { Button } from './Button';
import { Package, HelpCircle } from 'lucide-react';

interface BlindBoxProps {
  onOpen: (species: Species) => void;
  isConnected: boolean;
  onConnectReq: () => void;
}

export const BlindBox: React.FC<BlindBoxProps> = ({ onOpen, isConnected, onConnectReq }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleInteraction = () => {
    if (!isConnected) {
      onConnectReq();
      return;
    }
    openBox();
  };

  const openBox = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setIsOpening(true);
      
      const randomSpecies = SPECIES_LIST[Math.floor(Math.random() * SPECIES_LIST.length)];
      
      setTimeout(() => {
        onOpen(randomSpecies);
      }, 500); 
    }, 1500); 
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-300 rounded-full blur-[60px] opacity-50 animate-pulse"></div>

      <div 
        className={`relative w-56 h-56 mb-12 transition-all duration-100 cursor-pointer group ${isShaking ? 'animate-shake' : 'animate-float'}`}
        onClick={!isShaking && !isOpening ? handleInteraction : undefined}
      >
         {/* 3D Box Representation using Borders/Shadows */}
         <div className={`w-full h-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] rounded-[2.5rem] shadow-[0_20px_0_rgba(109,40,217,0.3)] flex items-center justify-center text-white relative z-10 border-[6px] border-white transform ${isOpening ? 'scale-150 opacity-0' : 'scale-100 opacity-100'} transition-all duration-500 ease-out group-hover:scale-105`}>
            
            {/* Box Details */}
            <div className="absolute inset-4 border-4 border-white/20 rounded-[1.5rem] border-dashed"></div>
            
            <HelpCircle size={80} strokeWidth={3} className="drop-shadow-md" />
            
            <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-12 bg-[#FFE66D] text-gray-900 border-4 border-white px-4 py-2 rounded-2xl font-black shadow-lg text-lg">
              FREE!
            </div>
         </div>
         
         {/* Floor Shadow */}
         <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/20 rounded-[100%] blur-sm z-0 transition-all duration-1000 group-hover:w-24 group-hover:opacity-50"></div>
      </div>

      <div className="text-center max-w-xs relative z-10">
        <h3 className="text-2xl font-black text-gray-800 mb-2 drop-shadow-sm">Mystery Box</h3>
        <p className="text-sm font-bold text-gray-500 mb-8 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border-2 border-white/50">
          Contains a dormant DNA sequence of a Matriarch. Tap to revive!
        </p>
        <Button variant="accent" size="lg" onClick={handleInteraction} disabled={isShaking || isOpening} className="w-full text-xl shadow-xl">
          {isShaking ? 'REVIVING...' : (isConnected ? 'OPEN BOX' : 'CONNECT WALLET')}
        </Button>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-8deg) scale(1.1); }
          75% { transform: rotate(8deg) scale(1.1); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
      `}</style>
    </div>
  );
};