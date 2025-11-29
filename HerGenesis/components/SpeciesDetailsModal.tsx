import React from 'react';
import { Species } from '../types';
import { X, MapPin, Calendar, Users, BookOpen, Dna, Skull } from 'lucide-react';
import { Button } from './Button';
import { MINT_COST } from '../constants';

interface SpeciesDetailsModalProps {
  species: Species;
  population: number;
  onClose: () => void;
  onMint: () => void;
}

export const SpeciesDetailsModal: React.FC<SpeciesDetailsModalProps> = ({ species, population, onClose, onMint }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-white overflow-hidden relative flex flex-col max-h-[85vh]" 
        onClick={e => e.stopPropagation()} // Prevent close when clicking inside
      >
        {/* Header Image - Fixed */}
        <div className="relative h-48 w-full bg-gray-100 shrink-0">
           <img src={species.image} alt={species.name} className="w-full h-full object-cover" />
           <div className={`absolute inset-0 ${species.color.replace('bg-', 'bg-').replace('100', '500')} mix-blend-overlay opacity-20`}></div>
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-gray-800 shadow-sm hover:bg-white transition-all z-10">
             <X size={20} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
           {/* Title Section */}
           <div className="mb-6">
             <h2 className="text-3xl font-black text-gray-800 leading-none mb-1">{species.name}</h2>
             <p className="text-sm font-bold text-gray-400 italic font-serif">{species.scientificName}</p>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-rose-400 mb-1 text-xs font-black uppercase tracking-wider">
                  <Calendar size={14} /> Extinct
                </div>
                <div className="text-gray-800 font-bold">{species.extinctionYear}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-emerald-400 mb-1 text-xs font-black uppercase tracking-wider">
                   <MapPin size={14} /> Origin
                </div>
                <div className="text-gray-800 font-bold">{species.origin}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 col-span-2">
                <div className="flex items-center gap-2 text-violet-400 mb-1 text-xs font-black uppercase tracking-wider">
                   <Users size={14} /> Current Population
                </div>
                <div className="text-2xl font-black text-gray-800">{population.toLocaleString()} <span className="text-sm font-medium text-gray-400">individuals revived</span></div>
              </div>
           </div>

           {/* Story Section */}
           <div className="mb-4">
             <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-black uppercase tracking-wider">
                <BookOpen size={14} /> Background Story
             </div>
             <p className="text-gray-600 leading-relaxed font-medium text-sm mb-4">
               {species.description}
             </p>
           </div>

           {/* Extinction Cause */}
           <div className="mb-4 bg-red-50 p-4 rounded-2xl border border-red-100">
             <div className="flex items-center gap-2 text-red-400 mb-2 text-xs font-black uppercase tracking-wider">
                <Skull size={14} /> Cause of Extinction
             </div>
             <p className="text-red-800 leading-relaxed font-bold text-sm">
               {species.extinctionCause}
             </p>
           </div>
        </div>

        {/* Fixed Footer Action */}
        <div className="p-6 border-t border-gray-100 bg-white z-10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           <Button variant="primary" size="lg" className="w-full shadow-xl" onClick={onMint}>
             <Dna size={20} />
             Revive for {MINT_COST} ETH
           </Button>
        </div>
      </div>
    </div>
  );
};