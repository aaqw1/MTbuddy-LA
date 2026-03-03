
import React from 'react';
import { ShieldCheck, CreditCard, X, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function PaymentModal({ isOpen, onClose, onConfirm, itemName }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-purple-600" size={20} />
            <span className="font-bold text-slate-900">Unlock Pro Analysis</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={18} /></button>
        </div>
        
        <div className="p-8 text-center">
           <h3 className="text-xl font-bold text-slate-900 mb-2">Accessing: {itemName}</h3>
           <p className="text-slate-500 mb-6">Unlock the full permit roadmap, cost breakdown, and architectural details for this option.</p>
           
           <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
             <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Hackathon Mode</p>
             <p className="text-sm text-amber-700">No real payment required. This is a simulation.</p>
           </div>

           <button 
             onClick={onConfirm}
             className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
           >
             <CreditCard size={18} /> Simulate Pay & Unlock
           </button>
        </div>
      </div>
    </div>
  );
}
