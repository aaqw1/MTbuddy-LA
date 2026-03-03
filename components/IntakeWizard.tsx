'use client';

import React, { useState, useRef } from 'react';
import { IntakeData } from '../types';
import { CheckCircle2, Circle, ArrowRight, ClipboardList, UploadCloud, X, FileText, ImageIcon, Video, Send, Sparkles } from 'lucide-react';

interface Props {
  onComplete: (data: IntakeData, files: File[], userMessage?: string) => void;
}

type QuestionKey = keyof IntakeData;

const IntakeWizard: React.FC<Props> = ({ onComplete }) => {
  const [data, setData] = useState<Partial<IntakeData>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (key: QuestionKey, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    // Auto-fill the "hasEvidencePack" if not set, assuming user is moving forward
    const finalData = { ...data, hasEvidencePack: data.hasEvidencePack || 'Yes' } as IntakeData;
    onComplete(finalData, files, userMessage);
  };

  const isFormValid = Object.keys(data).length >= 13; // Check if first 13 questions are answered (0-12)

  const renderQuestion = (label: string, key: QuestionKey, options: string[] = ['Yes', 'No', 'Unsure']) => (
    <div className="mb-8 animate-in slide-in-from-bottom-2 duration-500">
      <p className="text-sm font-medium text-slate-600 mb-4 ml-1">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleSelect(key, opt)}
            className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all shadow-sm
              ${data[key] === opt
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20'
                : 'bg-white/60 backdrop-blur-sm border border-white/80 text-slate-600 hover:bg-white/90 hover:shadow-md'}
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden relative z-10">

        <div className="px-10 py-10 text-center border-b border-white/40 bg-white/20">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Project Assessment</h2>
          <p className="text-slate-500 text-base max-w-3xl mx-auto">
            Choose your options that applies with your requirements, start, and wait to glows.
          </p>
        </div>

        <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* Section A */}
          <div className="mb-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-slate-300"></span>
              Building & Scope
              <span className="flex-1 h-[1px] bg-slate-300"></span>
            </h3>
            {renderQuestion("0) What type of residence is this?", "residentialType", ["Single Family", "Condo", "Townhouse", "Unsure"])}
            {renderQuestion("1) Do you have a bathroom already, or is this a NEW bathroom in a new area?", "isNewBathroom", ["Existing", "New Area", "Unsure"])}
            {renderQuestion("2) Are you changing the layout (moving fixtures), or is it mostly like-for-like?", "isLayoutChange", ["Layout Change", "Like-for-Like", "Unsure"])}
            {renderQuestion("3) What is your bathing preference?", "tubShowerPreference", ["Walk-in Shower", "Alcove Tub", "Free Standing Tub", "Keep Existing"])}
            {renderQuestion("4) Are you removing or building any walls?", "isRemovingWalls")}
            {renderQuestion("5) Are you changing any door openings or windows?", "isChangingOpenings")}
            {renderQuestion("6) Are you relocating plumbing fixtures or adding drains?", "isRelocatingPlumbing")}
            {renderQuestion("7) Are you changing electrical (new circuits/lights)?", "isChangingElectrical")}
            {renderQuestion("8) Are you changing ventilation (fans/ducts)?", "isChangingVentilation")}
            {renderQuestion("9) Any chance this touches a load-bearing wall?", "isLoadBearing")}
          </div>

          {/* Section B */}
          <div className="mb-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-slate-300"></span>
              Permit & Timeline
              <span className="flex-1 h-[1px] bg-slate-300"></span>
            </h3>
            {renderQuestion("10) Who will pull the permit?", "permitPuller", ["Homeowner", "Contractor", "Unsure"])}
            {renderQuestion("11) What matters more?", "priority", ["Speed/Low Risk", "Best Layout", "Unsure"])}
            {renderQuestion("12) Are you okay with Plan Check revisions?", "okayWithRevisions")}
          </div>

          {/* Section C: Evidence Pack & Chatbox */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-slate-300"></span>
              Evidence Pack
              <span className="flex-1 h-[1px] bg-slate-300"></span>
            </h3>

            <div className="mb-8">
              <p className="text-sm font-medium text-slate-600 mb-4 ml-1">13) Please provide a VIDEO of the existing condition.</p>

              <div className="bg-white/50 border border-slate-200 rounded-3xl p-2 md:p-4 shadow-sm">
                {/* File Upload Zone */}
                <div
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-white/80 hover:border-blue-400 transition-all cursor-pointer group mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="text-blue-500" size={24} />
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">Click to upload Video, Photos or Plans</p>
                  <p className="text-xs text-slate-400 mt-1">Supports MP4, MOV, JPG, PDF</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="image/*,application/pdf,video/*"
                  />
                </div>

                {/* File Previews */}
                {files.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {files.map((file, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                        {file.type.includes('pdf') ? (
                          <div className="bg-red-50 p-2 rounded-lg text-red-500"><FileText size={16} /></div>
                        ) : file.type.includes('video') ? (
                          <div className="bg-purple-50 p-2 rounded-lg text-purple-500"><Video size={16} /></div>
                        ) : (
                          <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><ImageIcon size={16} /></div>
                        )}
                        <span className="text-xs text-slate-600 truncate flex-1 font-medium">{file.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chatbox Input */}
                <div className="relative mt-4">
                  <textarea
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 pr-36 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none min-h-[80px]"
                    placeholder="Describe your project goals here..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={handleGenerate}
                      disabled={!isFormValid}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black disabled:opacity-50 transition-all shadow-md text-xs md:text-sm"
                    >
                      Generate Analysis <Sparkles size={16} />
                    </button>
                  </div>
                </div>
                {!isFormValid && (
                  <p className="text-xs text-center text-red-400 mt-2">Please answer all assessment questions above (0-12) to proceed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeWizard;