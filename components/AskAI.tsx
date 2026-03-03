'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Paperclip, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { askQuestion } from '../services/apiClient';
import { AiResponse } from '../types';
import ReactMarkdown from 'react-markdown';

const AskAI: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    setHasSearched(true);

    try {
      const result = await askQuestion(query);
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-700 ease-in-out ${hasSearched ? 'mt-20 mb-20' : ''}`}>

      {/* Hero Title - Fades out/shrinks when searched */}
      <div className={`text-center transition-all duration-500 mb-10 ${hasSearched ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <h1 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4 tracking-tight">
          What do you want to know?
        </h1>
        <p className="text-slate-500 text-lg">
          Ask about LADBS codes, bathroom permits, or inspection rules.
        </p>
      </div>

      {/* Input Box Container */}
      <div className={`relative bg-white rounded-2xl border transition-all duration-300 group
        ${hasSearched
          ? 'border-slate-200 shadow-sm'
          : 'border-slate-300 shadow-xl shadow-slate-200/40 hover:border-slate-400'
        }
      `}>
        {/* Top Tab (simulated) */}
        {!hasSearched && (
          <div className="absolute -top-10 left-0 flex gap-2">
            <div className="bg-white border border-b-0 border-slate-300 px-6 py-2 rounded-t-lg text-sm font-medium text-slate-700 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
              Ask Expert
            </div>
            <div className="bg-slate-100 border border-transparent px-6 py-2 rounded-t-lg text-sm font-medium text-slate-500 hover:bg-slate-200 cursor-not-allowed">
              Draft Plan
            </div>
          </div>
        )}

        <form onSubmit={handleAsk} className="relative p-2">
          <textarea
            ref={textareaRef}
            className="w-full pl-4 pr-12 py-4 text-lg bg-transparent border-none rounded-xl focus:ring-0 placeholder:text-slate-400 resize-none overflow-hidden text-slate-800"
            placeholder={hasSearched ? "Ask a follow up question..." : "e.g. Do I need a permit to replace my toilet?"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            autoFocus
          />

          <div className="flex items-center justify-between px-3 pb-2 pt-1">
            <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
              <Paperclip size={20} />
            </button>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`p-2 rounded-xl transition-all duration-200 flex items-center justify-center
                ${query.trim()
                  ? 'bg-slate-900 text-white hover:bg-black shadow-md'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
              `}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      {hasSearched && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="space-y-4 px-4">
              <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                <Sparkles size={18} />
                <span className="text-sm font-medium">Researching regulations...</span>
              </div>
            </div>
          ) : response ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Response Header */}
              <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Sparkles size={16} className="text-blue-500" />
                  <span className="text-sm font-medium">Answer</span>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="p-6 md:p-8">
                <article className="prose prose-slate prose-lg max-w-none 
                    prose-headings:text-slate-800 prose-headings:font-bold prose-headings:text-lg prose-headings:mb-3
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-li:text-slate-600 prose-li:marker:text-slate-300
                    prose-a:text-blue-600 hover:prose-a:text-blue-500
                  ">
                  <ReactMarkdown>{response.answer}</ReactMarkdown>
                </article>

                {/* Citations Footer */}
                {response.citations && response.citations.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      <BookOpen size={12} /> Sources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {response.citations.map((cit, idx) => (
                        <a
                          key={idx}
                          href={cit.location.startsWith('http') ? cit.location : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-xs border border-slate-200 transition-colors truncate max-w-xs"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                          {cit.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AskAI;