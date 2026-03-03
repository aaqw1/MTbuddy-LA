'use client';

import React, { useState } from 'react';
import { ScopeData } from '../types';
import { Briefcase, AlertTriangle, ArrowRight, LayoutDashboard } from 'lucide-react';

interface Props {
  onComplete: (scope: ScopeData) => void;
}

const ScopeIntake: React.FC<Props> = ({ onComplete }) => {
  const [formData, setFormData] = useState<ScopeData>({
    address: '',
    zip: '',
    jurisdiction: 'CITY_OF_LA',
    isDemolitionOnly: false,
    replaceFixturesSameLocation: false,
    relocatePlumbing: false,
    newPenetrations: false,
    newCircuits: false,
    addExhaustFan: false,
    modifyStructural: false,
    waterproofingChanges: false,
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">

        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="p-3.5 bg-slate-900 text-white rounded-xl shadow-md">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Start Your Project</h2>
            <p className="text-slate-500">Define your scope to get a tailored permit roadmap.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Project Address</label>
              <input
                type="text"
                name="address"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Zip Code</label>
              <input
                type="text"
                name="zip"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="90012"
                value={formData.zip}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jurisdiction</label>
            <div className="relative">
              <select
                name="jurisdiction"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                value={formData.jurisdiction}
                onChange={handleChange}
              >
                <option value="CITY_OF_LA">City of Los Angeles (LADBS)</option>
                <option value="UNINCORPORATED">LA County (Unincorporated)</option>
                <option value="OTHER">Other City (Santa Monica, Burbank, etc.)</option>
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">▼</div>
            </div>
            {formData.jurisdiction !== 'CITY_OF_LA' && (
              <div className="mt-3 p-4 bg-amber-50 text-amber-800 text-sm rounded-xl flex items-start gap-3 border border-amber-100">
                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                <p>This tool is optimized for LADBS rules. Other jurisdictions have different requirements.</p>
              </div>
            )}
          </div>

          {/* Scope Grid */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700">Scope of Work</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'replaceFixturesSameLocation', label: 'Replace fixtures (same location)' },
                { key: 'relocatePlumbing', label: 'Relocate plumbing / waste lines' },
                { key: 'modifyStructural', label: 'Modify walls / structural' },
                { key: 'waterproofingChanges', label: 'Tub-to-shower / Waterproofing' },
                { key: 'newCircuits', label: 'New electrical circuits' },
                { key: 'addExhaustFan', label: 'Add/Replace exhaust fan' },
                { key: 'newPenetrations', label: 'New exterior penetrations' },
                { key: 'isDemolitionOnly', label: 'Demolition Only' },
              ].map((item) => (
                <label key={item.key} className={`
                  flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all border
                  ${(formData as any)[item.key] ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}
                `}>
                  <input
                    type="checkbox"
                    name={item.key}
                    checked={(formData as any)[item.key]}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-offset-0 focus:ring-0 rounded border-slate-300"
                  />
                  <span className={`text-sm font-medium ${(formData as any)[item.key] ? 'text-blue-800' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description Details</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Describe your project... (e.g. Enlarging shower, moving toilet 2 feet...)"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg"
          >
            Analyze Project <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScopeIntake;