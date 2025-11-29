import React, { useEffect } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100',
    error: 'bg-rose-100 text-rose-800 border-rose-200 shadow-rose-100',
    info: 'bg-violet-100 text-violet-800 border-violet-200 shadow-violet-100'
  };

  const icons = {
    success: <Check size={20} strokeWidth={3} />,
    error: <AlertCircle size={20} strokeWidth={3} />,
    info: <Info size={20} strokeWidth={3} />
  };

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-b-4 min-w-[300px] backdrop-blur-md ${styles[type]}`}>
      <div className="p-1 rounded-full bg-white/40">
        {icons[type]}
      </div>
      <span className="font-bold text-sm flex-1">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};