import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Wallet, Leaf, Dna, Info, Plus, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './components/Button';
import { SPECIES_LIST, MINT_COST, GAME_RULES } from './constants';
import { Pet, GrowthStage, PopulationData, Species } from './types';
import { PetInteraction } from './components/PetInteraction';
import { BlindBox } from './components/BlindBox';
import { Toast, ToastType } from './components/Toast';
import { WalletModal } from './components/WalletModal';
import { SpeciesDetailsModal } from './components/SpeciesDetailsModal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

// --- Layout Components ---

const Navbar = ({ address, onConnectClick }: { address: string | null, onConnectClick: () => void }) => (
  <nav className="fixed top-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
    <div className="bg-white/90 backdrop-blur-md rounded-full shadow-game p-2 pl-6 pr-2 flex justify-between items-center gap-8 border-2 border-white pointer-events-auto max-w-2xl w-full mx-auto">
      <div className="flex items-center">
        <img 
          src="https://github.com/978893422-netizen/my-assets/blob/main/logo.png?raw=true" 
          alt="HerGenesis" 
          className="h-6 object-contain"
        />
      </div>
      <Button 
        variant={address ? 'danger' : 'secondary'} 
        size="sm" 
        onClick={onConnectClick}
        className="shadow-sm"
      >
        <Wallet size={16} />
        {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect'}
      </Button>
    </div>
  </nav>
);

const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (t: string) => void }) => {
  const tabs = [
    { id: 'home', icon: <Leaf size={24} />, label: 'Eco' },
    { id: 'adopt', icon: <Dna size={24} />, label: 'Adopt' },
    { id: 'stats', icon: <Trophy size={24} />, label: 'Rank' },
  ];
  return (
    <div className="fixed bottom-6 w-full flex justify-center z-40 pointer-events-none">
      <div className="bg-gray-900 text-white rounded-[2rem] p-2 shadow-2xl pointer-events-auto flex gap-2 border-4 border-gray-800">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-[1.5rem] transition-all duration-300 relative ${
                isActive 
                  ? 'bg-[#8B5CF6] text-white -translate-y-4 shadow-lg scale-110' 
                  : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              {tab.icon}
              {isActive && (
                <span className="absolute -bottom-6 text-[10px] font-black text-gray-900 bg-white px-2 py-0.5 rounded-full shadow-sm">
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
};

// --- MOCK DATA FOR CHARTS ---
const initialPopulationData: PopulationData[] = [
  { day: 'Mon', Dodo: 120, Mammoth: 80, Thylacine: 40, IrishElk: 20 },
  { day: 'Tue', Dodo: 132, Mammoth: 85, Thylacine: 45, IrishElk: 22 },
  { day: 'Wed', Dodo: 145, Mammoth: 92, Thylacine: 55, IrishElk: 28 },
  { day: 'Thu', Dodo: 160, Mammoth: 100, Thylacine: 68, IrishElk: 35 },
  { day: 'Fri', Dodo: 180, Mammoth: 115, Thylacine: 75, IrishElk: 42 },
  { day: 'Sat', Dodo: 210, Mammoth: 130, Thylacine: 90, IrishElk: 50 },
  { day: 'Sun', Dodo: 250, Mammoth: 150, Thylacine: 110, IrishElk: 65 },
];

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState('adopt');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [viewingSpecies, setViewingSpecies] = useState<Species | null>(null);
  const [hasMintedFree, setHasMintedFree] = useState(false);
  const [popData, setPopData] = useState(initialPopulationData);
  const [notification, setNotification] = useState<{msg: string, type: ToastType} | null>(null);
  
  // Wallet Modal State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  // Track actions that need to happen after connection (e.g. { type: 'mint', species: ... })
  const [pendingAction, setPendingAction] = useState<{type: 'mint', species: Species, isFree: boolean} | null>(null);

  const showToast = (msg: string, type: ToastType) => {
    setNotification({ msg, type });
  };

  const getPopulationCount = (speciesId: string) => {
    const latest = popData[popData.length - 1];
    if (speciesId === 'dodo') return latest.Dodo;
    if (speciesId === 'mammoth') return latest.Mammoth;
    if (speciesId === 'thylacine') return latest.Thylacine;
    if (speciesId === 'irish_elk') return latest.IrishElk;
    return 0;
  };

  // Click handler for Navbar Connect button
  const handleConnectClick = () => {
    if (walletAddress) {
       setWalletAddress(null);
       showToast("Wallet disconnected.", 'info');
    } else {
       setIsWalletModalOpen(true);
    }
  };

  // Called when a wallet is selected from the modal
  const handleWalletSelect = async (walletId: string) => {
    setIsWalletModalOpen(false);
    
    // Check if Ethereum provider exists
    if (typeof window.ethereum === 'undefined') {
      showToast("No wallet extension found. Please install MetaMask or OneKey.", 'error');
      // Fallback for demo/dev purposes if desired, or just return
      return;
    }

    try {
      // 1. Request Account Access from the Wallet Plugin
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        showToast("Wallet connected successfully!", 'success');
        executePendingAction();
      } else {
        showToast("No accounts found.", 'error');
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      if (error.code === 4001) {
        showToast("Connection rejected by user", 'error');
      } else {
        showToast("Failed to connect wallet.", 'error');
      }
    }
  };

  const executePendingAction = () => {
    if (pendingAction) {
      if (pendingAction.type === 'mint') {
        processMint(pendingAction.species, pendingAction.isFree);
      }
      setPendingAction(null);
    }
  };

  // Initiate Mint (Check wallet -> Open Modal or Process)
  const handleMintRequest = (species: Species, isFree: boolean) => {
    if (!walletAddress) {
      setPendingAction({ type: 'mint', species, isFree });
      setIsWalletModalOpen(true);
      return;
    }
    processMint(species, isFree);
  };

  // Actual Mint Logic (Includes Payment)
  const processMint = async (species: Species, isFree: boolean) => {
    if (!isFree) {
      // Handle Payment Logic for Paid Mint
      if (typeof window.ethereum === 'undefined' || !walletAddress) {
        showToast("Wallet not connected", 'error');
        return;
      }

      try {
        // 0.001 ETH in Hex (Wei) -> 1000000000000000 Wei -> 0x38d7ea4c68000
        // We'll send this to a dummy treasury address or the user's own address for testing safety
        const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dEaD"; 
        const amountHex = "0x38d7ea4c68000"; // 0.001 ETH

        showToast("Please confirm transaction in your wallet...", 'info');

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletAddress,
              to: TREASURY_ADDRESS,
              value: amountHex,
              // gas: '0x5208', // 21000 Gwei (optional, let wallet estimate)
            },
          ],
        });

        console.log("Transaction sent:", txHash);
        showToast("Transaction submitted! Minting species...", 'success');

      } catch (error: any) {
        console.error("Payment failed:", error);
        if (error.code === 4001) {
          showToast("Transaction rejected.", 'error');
        } else {
          showToast("Transaction failed.", 'error');
        }
        return; // Stop minting process if payment fails
      }
    }

    // Proceed to create pet state only if payment succeeded (or is free)
    const newPet: Pet = {
      id: Math.random().toString(36).substr(2, 9),
      speciesId: species.id,
      name: `${species.name} #${Math.floor(Math.random() * 1000)}`,
      stage: GrowthStage.JUVENILE,
      mintDate: Date.now(),
      metadata: {
        saturation: 0,
        intimacy: 0,
        health: 0,
        lastFedAt: 0,
        lastPettedAt: 0,
        lastCleanedAt: 0,
      }
    };

    setMyPets(prev => [...prev, newPet]);
    showToast(isFree ? `You found a ${species.name}!` : `Welcome back, ${species.name}!`, 'success');

    if (isFree) {
      setHasMintedFree(true);
    }
    
    // Slight delay to allow animations to finish before switching tab
    setTimeout(() => {
        setActiveTab('home');
    }, 1500);
  };

  const handleUpdatePet = (updatedPet: Pet) => {
    setMyPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
    setSelectedPet(updatedPet);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="pt-24 pb-28 px-4 max-w-2xl mx-auto min-h-screen">
            <h2 className="text-3xl font-black text-gray-800 mb-6 drop-shadow-sm flex items-center gap-2">
              <Leaf className="text-emerald-500" fill="currentColor" /> My Sanctuary
            </h2>
            
            {myPets.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-8 text-center shadow-game border-2 border-white">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Species Revived Yet</h3>
                <p className="text-gray-500 mb-6 text-sm">The sanctuary is empty. Use the ancient DNA synthesizer to revive a species.</p>
                <Button onClick={() => setActiveTab('adopt')} variant="secondary" className="mx-auto">
                  Go to Adopt <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myPets.map(pet => {
                  const species = SPECIES_LIST.find(s => s.id === pet.speciesId);
                  if(!species) return null;
                  return (
                    <div 
                      key={pet.id} 
                      onClick={() => setSelectedPet(pet)}
                      className="bg-white rounded-[2rem] p-4 shadow-game hover:shadow-game-hover transition-all cursor-pointer border-2 border-white group relative overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 ${species.color.replace('bg-', 'bg-')} opacity-20 rounded-bl-[4rem] transition-transform group-hover:scale-110`}></div>
                      <div className="flex items-center gap-4 mb-3">
                        <img src={species.image} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-gray-100" />
                        <div>
                          <h3 className="font-bold text-gray-800 leading-tight">{pet.name}</h3>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{pet.stage}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden" title="Love">
                          <div className="h-full bg-pink-400" style={{width: `${Math.min(100, pet.metadata.intimacy)}%`}}></div>
                        </div>
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden" title="Hunger">
                          <div className="h-full bg-orange-400" style={{width: `${Math.min(100, pet.metadata.saturation)}%`}}></div>
                        </div>
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden" title="Health">
                          <div className="h-full bg-emerald-400" style={{width: `${Math.min(100, pet.metadata.health)}%`}}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'adopt':
        return (
          <div className="pt-24 pb-28 px-4 max-w-2xl mx-auto min-h-screen">
             <h2 className="text-3xl font-black text-gray-800 mb-2 text-center drop-shadow-sm">Maternal Rebirth</h2>
             <p className="text-center text-gray-500 mb-8 font-medium">The continuation and reproduction of female life</p>

             {/* Free Mint Section */}
             {!hasMintedFree && (
               <BlindBox 
                 onOpen={(s) => handleMintRequest(s, true)} 
                 isConnected={!!walletAddress}
                 onConnectReq={() => setIsWalletModalOpen(true)}
               />
             )}

             {/* Paid Mint List */}
             <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 ml-2 uppercase tracking-wider opacity-60">Available Samples</h3>
                {SPECIES_LIST.map(species => (
                  <div 
                    key={species.id} 
                    onClick={() => setViewingSpecies(species)}
                    className="bg-white rounded-[2rem] p-4 flex gap-4 items-center shadow-game border-2 border-white cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 group"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 group-hover:shadow-md transition-shadow">
                      <img src={species.image} alt={species.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800">{species.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{species.description}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">Extinct: {species.extinctionYear}</span>
                        <Button 
                          size="sm" 
                          variant="primary" 
                          onClick={(e) => {
                             e.stopPropagation();
                             handleMintRequest(species, false);
                          }}
                        >
                          {MINT_COST} ETH
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'stats':
        return (
          <div className="pt-24 pb-28 px-4 max-w-2xl mx-auto min-h-screen">
            <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" fill="currentColor" /> Ecosystem Stats
            </h2>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-game border-2 border-white mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Population Growth</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={popData}>
                    <defs>
                      <linearGradient id="colorDodo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F472B6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F472B6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorThy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorElk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                      itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                    />
                    {/* Render Order: Largest first to keep smaller areas visible on top if not stacked. Or stacked if needed. 
                        Given values: Dodo(120)>Mam(80)>Thy(40)>Elk(20).
                        Rendering Dodo first puts it in the background. */}
                    <Area type="monotone" dataKey="Dodo" stroke="#F472B6" fillOpacity={1} fill="url(#colorDodo)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Mammoth" stroke="#60A5FA" fillOpacity={1} fill="url(#colorMam)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Thylacine" stroke="#FBBF24" fillOpacity={1} fill="url(#colorThy)" strokeWidth={3} />
                    <Area type="monotone" dataKey="IrishElk" stroke="#34D399" fillOpacity={1} fill="url(#colorElk)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-white">
                 <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revived</div>
                 <div className="text-3xl font-black text-gray-800">1,240</div>
               </div>
               <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-white">
                 <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Keepers</div>
                 <div className="text-3xl font-black text-gray-800">856</div>
               </div>
            </div>
          </div>
        );
      
      default: 
        return null;
    }
  };

  return (
    <Router>
      <div className="min-h-screen font-sans selection:bg-violet-200">
        <Navbar address={walletAddress} onConnectClick={handleConnectClick} />
        
        {renderContent()}
        
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        {selectedPet && (
          <PetInteraction 
            pet={selectedPet} 
            onUpdatePet={handleUpdatePet} 
            onClose={() => setSelectedPet(null)}
            onNotify={showToast}
          />
        )}

        {viewingSpecies && (
          <SpeciesDetailsModal 
            species={viewingSpecies}
            population={getPopulationCount(viewingSpecies.id)}
            onClose={() => setViewingSpecies(null)}
            onMint={() => {
              handleMintRequest(viewingSpecies, false);
              setViewingSpecies(null);
            }}
          />
        )}

        {notification && (
          <Toast 
            message={notification.msg} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}

        <WalletModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)} 
          onSelect={handleWalletSelect}
        />
      </div>
    </Router>
  );
}