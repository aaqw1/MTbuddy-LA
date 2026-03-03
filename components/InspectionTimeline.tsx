import React, { useEffect, useState } from 'react';
import { AiResponse } from '../types';
import { queryGeminiWithRAG } from '../services/geminiService';
import { retrieveContext } from '../services/ragService';
import { Loader2, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const InspectionTimeline: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<AiResponse | null>(null);
  const [commonFails, setCommonFails] = useState<AiResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const context = await retrieveContext("inspection bathroom residential common corrections");
      
      const timelineQuery = `
        Create a Chronological Inspection Timeline for a bathroom remodel.
        Format: Bulleted list.
        Each bullet: **Stage Name**: What is checked.
        Concise.
      `;
      
      const failsQuery = `
        List the top 3 specific reasons bathroom inspections fail in LA.
        Format: Bulleted list.
        Concise.
      `;

      const [timelineRes, failsRes] = await Promise.all([
        queryGeminiWithRAG(timelineQuery, context),
        queryGeminiWithRAG(failsQuery, context)
      ]);

      setTimelineData(timelineRes);
      setCommonFails(failsRes);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center mt-20">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Timeline Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
            <Calendar size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Project Timeline</h2>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
           <article className="prose prose-slate prose-lg max-w-none 
             prose-headings:text-slate-800 prose-headings:font-bold prose-headings:text-lg
             prose-li:marker:text-blue-500 prose-li:pl-2
           ">
             <ReactMarkdown>{timelineData?.answer}</ReactMarkdown>
           </article>
        </div>
      </section>

      {/* Common Fails Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Critical Fail Points</h2>
        </div>
        
        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200 shadow-sm">
             <div className="prose prose-amber max-w-none 
                prose-strong:text-amber-900 prose-li:marker:text-amber-600
             ">
               <ReactMarkdown>{commonFails?.answer}</ReactMarkdown>
             </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InspectionTimeline;