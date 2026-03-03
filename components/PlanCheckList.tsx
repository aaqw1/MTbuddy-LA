import React, { useEffect, useState } from 'react';
import { ScopeData, AiResponse } from '../types';
import { queryGeminiWithRAG } from '../services/geminiService';
import { retrieveContext } from '../services/ragService';
import { Loader2, Download, UploadCloud, CheckSquare, ClipboardCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  scope: ScopeData;
}

const PlanCheckList: React.FC<Props> = ({ scope }) => {
  const [loading, setLoading] = useState(true);
  const [checklistResponse, setChecklistResponse] = useState<AiResponse | null>(null);

  useEffect(() => {
    const genChecklist = async () => {
      const userQuery = `
        Task: Create a Plan Check Submittal Checklist for a bathroom remodel.
        
        Scope:
        - ${scope.description}
        - Structural: ${scope.modifyStructural}
        - Plumbing Relocation: ${scope.relocatePlumbing}

        Format Requirements:
        - Use a Markdown list.
        - Group into: "Required Drawings", "Documents", "Calculations".
        - Bullet point each item.
        - Be extremely concise.
        - Cite specific bulletins.
      `;

      const context = await retrieveContext("submittal requirements plan check bathroom");
      const result = await queryGeminiWithRAG(userQuery, context);
      setChecklistResponse(result);
      setLoading(false);
    };

    genChecklist();
  }, [scope]);

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto max-w-4xl mt-8">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Compiling Submittal Package...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Submittal Package</h2>
          <p className="text-slate-500">Required documents for your Plan Check submission.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm">
            <UploadCloud size={16} /> Upload Plans
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-100">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checklist */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <ClipboardCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Generated Checklist</h3>
             </div>
             
             {/* Styled Markdown content */}
             <article className="prose prose-slate prose-sm max-w-none 
                prose-headings:font-bold prose-headings:text-slate-800 prose-headings:mt-6 prose-headings:mb-3
                prose-ul:space-y-2 prose-li:my-0 prose-li:text-slate-700
                prose-p:hidden
             ">
                <ReactMarkdown>{checklistResponse?.answer}</ReactMarkdown>
             </article>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
               <CheckSquare size={18} /> Pro Tips
             </h3>
             <ul className="space-y-4">
               {[
                 "Draw plans to scale (1/4\" = 1').",
                 "Note 'Shower Pan Test' (24hr) explicitly.",
                 "Verify Smoke/CO detectors on plan.",
                 "Bring 2 sets of everything."
               ].map((tip, i) => (
                 <li key={i} className="flex gap-3 text-sm text-blue-800 bg-white/50 p-3 rounded-lg border border-blue-100/50">
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                    {tip}
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCheckList;