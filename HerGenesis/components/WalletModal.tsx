import React from 'react';
import { X, Wallet, Shield, Zap, Globe } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const wallets = [
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-8 h-8" />,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    { 
      id: 'onekey', 
      name: 'OneKey', 
      icon: <img src="https://github.com/978893422-netizen/my-assets/blob/main/App_Icon_17d2b7af2f.png?raw=true" alt="OneKey" className="w-8 h-8 rounded-full" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    { 
      id: 'rainbow', 
      name: 'Rainbow', 
      icon: <img src="https://github.com/978893422-netizen/my-assets/blob/main/oFjLtCxBt9OTckVaAY2EMUHYw.png?raw=true" alt="Rainbow" className="w-8 h-8 rounded-full" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    { 
      id: 'walletconnect', 
      name: 'WalletConnect', 
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-4 border-white overflow-hidden relative transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-800">Connect Wallet</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Choose your provider</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Wallet List */}
        <div className="p-4 space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onSelect(wallet.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${wallet.color} border-transparent hover:border-current hover:bg-white hover:shadow-md`}
            >
              <div className="bg-white p-2 rounded-xl shadow-sm">
                {wallet.icon}
              </div>
              <span className="font-bold text-lg flex-1 text-left">{wallet.name}</span>
              <div className="opacity-0 group-hover:opacity-100">
                <Zap size={16} fill="currentColor" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            By connecting, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};