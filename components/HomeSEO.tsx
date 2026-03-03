'use client';

import React from 'react';
import { Search, Book, CheckSquare, ChevronUp, ChevronDown, FileText, ClipboardList } from 'lucide-react';

export default function HomeSEO() {
  const faq = [
    {
      q: "Do I need a permit to replace a toilet in LA?",
      a: "Generally, no, if it is a like-for-like replacement in the same location. However, if you move the waste line or water supply, a permit is required."
    },
    {
      q: "How much does a bathroom permit cost in Los Angeles?",
      a: "Fees vary based on valuation and scope. A simple express permit might cost around $150-$300, while full plan checks for major remodels can be higher."
    },
    {
      q: "Can I do my own plumbing work?",
      a: "In an owner-occupied single-family dwelling, homeowners can often pull permits and do the work themselves, but they are held to the same code standards as professionals."
    }
  ];

  return (
    <section className="w-full pb-24 relative overflow-hidden">

      {/* Decorative Wave Line for How It Works */}
      <div className="absolute top-[280px] left-0 w-full h-px hidden md:block">
        <svg className="w-full h-24 text-blue-200" preserveAspectRatio="none" viewBox="0 0 1200 100">
          <path d="M0,50 C300,50 300,20 600,50 C900,80 900,50 1200,50" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* How it Works - Added scroll-mt-32 for sticky header offset */}
      <div id="how-it-works" className="max-w-6xl mx-auto px-6 pt-20 relative z-10 scroll-mt-32">
        <h2 className="text-4xl font-sans font-medium text-slate-800 text-center mb-24">How it Works</h2>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center relative group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center text-blue-500 mb-6 -mt-16 group-hover:rotate-6 transition-transform">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Identify Your Bathroom Remodel Scope</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload photos or a quick video and answer a few questions. We identify the code requirements and permit triggers instantly.
            </p>
            {/* Waveform graphic imitation */}
            <div className="mt-6 flex gap-1 items-end h-8 opacity-30">
              <div className="w-1 bg-blue-500 h-3 rounded-full animate-pulse"></div>
              <div className="w-1 bg-blue-500 h-6 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 bg-blue-500 h-4 rounded-full animate-pulse delay-100"></div>
              <div className="w-1 bg-blue-500 h-8 rounded-full animate-pulse delay-150"></div>
              <div className="w-1 bg-blue-500 h-2 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center relative group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center text-blue-500 mb-6 -mt-16 group-hover:rotate-6 transition-transform">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Get Permit-Ready Documentation</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Receive a Permit Readiness Report with plan-check guidance: recommended drawings (floor plans), required forms, and calculation templates.
            </p>
            <div className="mt-6 flex gap-1 items-end h-8 opacity-30">
              <div className="w-full h-px bg-blue-400"></div>
              <svg width="40" height="20" viewBox="0 0 40 20" className="text-blue-500 stroke-current fill-none">
                <path d="M0,10 Q10,0 20,10 T40,10" strokeWidth="2" />
              </svg>
              <div className="w-full h-px bg-blue-400"></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center relative group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center text-blue-500 mb-6 -mt-16 group-hover:rotate-6 transition-transform">
              <ClipboardList size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Follow a Step-by-Step Checklist</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Use a clear task checklist to move from design to permit to construction: choose licensed contractors, verify insurance, and prepare for inspection.
            </p>
            <div className="mt-6 space-y-2 w-1/2 opacity-40">
              <div className="h-1.5 bg-blue-500 rounded-full w-full"></div>
              <div className="h-1.5 bg-blue-500 rounded-full w-3/4"></div>
              <div className="h-1.5 bg-blue-500 rounded-full w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Guides - Added scroll-mt-32 for sticky header offset */}
      <div id="guides" className="max-w-6xl mx-auto px-6 pt-32 relative z-10 scroll-mt-32">
        <h2 className="text-4xl font-sans font-medium text-slate-800 text-center mb-16">Popular Guides</h2>

        {/* Connecting Line */}
        <div className="absolute top-[280px] left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent hidden md:block"></div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Search, title: "Los Angeles Bathroom Remodel Permit Basics (LADBS)", desc: "Key permit triggers for bathroom remodels in LA—plumbing, electrical, layout changes, and finish upgrades." },
            { icon: FileText, title: "LADBS Plan Check Checklist for Bathroom Remodels", desc: "A practical checklist for permit-ready drawings, scope notes, and documentation before LADBS submission." },
            { icon: ClipboardList, title: "Los Angeles Bathroom Remodel Cost Guide & Budget Template", desc: "Typical cost ranges in LA plus a simple budget template covering labor, materials, permits, and contingency." },
            { icon: CheckSquare, title: "Licensed Contractor Selection Guide for LA Bathroom Remodels", desc: "A step-by-step guide to compare bids, verify licensing/insurance, and set a clear scope of work." }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl text-center relative z-10 hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
              <div className="w-12 h-12 mx-auto bg-transparent border border-blue-200 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                <item.icon size={20} />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 pt-32 relative z-10">
        <h2 className="text-4xl font-sans font-medium text-slate-800 text-center mb-16">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faq.map((item, idx) => (
            <div key={idx} className="group glass-panel rounded-2xl overflow-hidden transition-all duration-300">
              <button
                className="w-full px-8 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling;
                  content?.classList.toggle('hidden');
                  e.currentTarget.querySelector('.icon')?.classList.toggle('rotate-180');
                }}
              >
                <span className="text-base font-medium text-slate-700">{item.q}</span>
                <ChevronDown className="icon text-slate-400 transition-transform duration-300" />
              </button>
              <div className="hidden px-8 pb-6 pt-0 animate-in slide-in-from-top-2">
                <div className="p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl border border-white/50">
                  <h5 className="font-bold text-slate-800 mb-2 text-sm">Answer</h5>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="max-w-4xl mx-auto px-6 pt-24 text-center">
        <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed uppercase tracking-widest opacity-60">
          <strong>Disclaimer:</strong> This tool utilizes Artificial Intelligence to analyze LADBS documents. It may produce inaccurate information. Always verify requirements with a licensed contractor or the Los Angeles Department of Building and Safety directly. This is not legal advice.
        </p>
      </div>
    </section>
  );
}