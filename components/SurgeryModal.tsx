
import React from 'react';
import { SurgeryReport } from '../types';
import { X, AlertTriangle, CheckCircle2, Hammer, Zap, Droplets, HardHat } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: SurgeryReport | null;
}

export default function SurgeryModal({ isOpen, onClose, report }: Props) {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
             <div className="flex items-center gap-3">
               <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                 Surgery Report
               </span>
               <h2 className="text-2xl font-bold text-slate-900">Existing Condition Analysis</h2>
             </div>
             <p className="text-slate-500 text-sm mt-1">Risk Assessment & Permit Triggers</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
           
           {/* Top Risk Banner */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                 <AlertTriangle className="text-orange-500" size={18} /> Major Permit Triggers
              </h3>
              <div className="flex flex-wrap gap-2">
                 {report.permit_triggers?.map((t, i) => (
                   <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-medium">
                     {t}
                   </span>
                 ))}
              </div>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">{report.overall_risk}</p>
           </div>

           {/* Keyframes Grid */}
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {report.keyframes?.map((frame) => (
                <div key={frame.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                   {/* Image Area */}
                   <div className="aspect-[3/4] bg-slate-900 relative group">
                      {frame.image_url ? (
                        <img src={frame.image_url} className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Generating Annotation...</div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-mono">
                        {frame.timestamp}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <h4 className="text-white font-bold text-sm">{frame.title}</h4>
                      </div>
                   </div>

                   {/* Annotation List */}
                   <div className="p-4 space-y-3">
                      {frame.annotations.map((note, i) => (
                        <div key={i} className="text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                           <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800">{note.object_name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                                ${note.risk_level === 'Red' ? 'bg-red-100 text-red-700' :
                                  note.risk_level === 'Orange' ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'}
                              `}>
                                {note.risk_level}
                              </span>
                           </div>
                           <p className="text-slate-500 leading-tight mb-1">{note.action} • {note.who}</p>
                           <p className="text-slate-400 italic font-light">{note.notes}</p>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
