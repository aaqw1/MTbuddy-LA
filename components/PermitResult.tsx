import React, { useEffect, useState } from 'react';
import { ScopeData, AiResponse, PermitPath } from '../types';
import { queryGeminiWithRAG } from '../services/geminiService';
import { retrieveContext } from '../services/ragService';
import { CheckCircle2, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  scope: ScopeData;
  onNext: () => void;
}

const PermitResult: React.FC<Props> = ({ scope, onNext }) => {
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [recommendedPath, setRecommendedPath] = useState<PermitPath>(PermitPath.UNCERTAIN);

  useEffect(() => {
    const fetchRecommendation = async () => {
      const userQuery = `
        Based on this scope:
        - Structural Changes: ${scope.modifyStructural}
        - Relocate Plumbing: ${scope.relocatePlumbing}
        - Waterproofing Changes: ${scope.waterproofingChanges}
        - Description: ${scope.description}
        
        Task:
        1. Recommend "Express e-Permit" OR "Plan Check".
        2. Provide a bulleted list of reasons why, citing LADBS rules.
        3. Keep it concise.
      `;

      const context = await retrieveContext("express permit plan check qualifiers bathroom");
      const result = await queryGeminiWithRAG(userQuery, context);
      setAiResponse(result);

      if (scope.modifyStructural || scope.relocatePlumbing) {
        setRecommendedPath(PermitPath.PLAN_CHECK);
      } else {
        setRecommendedPath(PermitPath.E_PERMIT);
      }
      
      setLoading(false);
    };

    fetchRecommendation();
  }, [scope]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto max-w-3xl mt-8">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Analyzing LADBS regulations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Recommendation Banner */}
      <div className={`relative overflow-hidden p-8 rounded-2xl border ${
        recommendedPath === PermitPath.E_PERMIT 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100' 
          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'
      }`}>
        <div className="relative z-10 flex items-start gap-6">
          <div className={`p-4 rounded-xl ${
             recommendedPath === PermitPath.E_PERMIT ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-amber-600 shadow-sm'
          }`}>
             {recommendedPath === PermitPath.E_PERMIT ? <CheckCircle2 size={32} /> : <FileText size={32} />}
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Recommended Pathway</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {recommendedPath === PermitPath.E_PERMIT ? "Express e-Permit" : "Plan Check Submission"}
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed max-w-2xl">
              {recommendedPath === PermitPath.E_PERMIT 
                ? "Good news! Your scope fits the criteria for an instant online permit."
                : "Your project involves structural or system changes that require a plan reviewer's approval."}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
          <Sparkles className="text-blue-500" size={18} />
          <h3 className="font-semibold text-slate-700">Official Regulatory Analysis</h3>
        </div>
        
        <div className="p-8">
          <article className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 max-w-none">
            <ReactMarkdown>{aiResponse?.answer}</ReactMarkdown>
          </article>

          {/* Source Footer */}
          {aiResponse?.citations && aiResponse.citations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sourced From</h4>
              <div className="flex flex-wrap gap-2">
                {aiResponse.citations.map((cit, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {cit.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="group bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-lg shadow-slate-200 hover:shadow-xl flex items-center gap-3"
        >
           Start Plan Check Process <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default PermitResult;