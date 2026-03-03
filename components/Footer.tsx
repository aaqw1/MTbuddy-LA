'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-24 pt-24 pb-12 overflow-hidden">
      {/* Footer Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-slate-50 to-transparent -z-10"></div>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">
            MTBuddy LA
          </Link>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
            We help homeowners and contractors navigate the complex Los Angeles Department of Building and Safety (LADBS) requirements for bathroom remodels.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-6 text-slate-800">Resources</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Inspection Checklist</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Permit Requirements</Link></li>
            <li><Link href="https://ladbs.org" target="_blank" className="hover:text-blue-600 transition-colors">LADBS Official Site</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-6 text-slate-800">Legal</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            <li className="pt-4 opacity-50 text-[10px] leading-tight">
              Not affiliated with LADBS. Information provided is for educational purposes only and does not constitute legal advice.
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-400">
        <p>&copy; 2026 MTech. All rights reserved.</p>
        <div className="flex gap-6">
          <span>Made in LA</span>
        </div>
      </div>
    </footer>
  );
}