'use client';

import React from 'react';
import { X, Send, MapPin, Phone, User, FileText, LayoutTemplate, Mail, Smartphone } from 'lucide-react';
import { DesignOption, IntakeData } from '../types';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  intakeData?: IntakeData;
  selectedDesign?: DesignOption | null;
  onSendRequest: (contactInfo: ContactInfo) => void;
}

export default function ConsultModal({ isOpen, onClose, intakeData, selectedDesign, onSendRequest }: Props) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;

    const contactInfo: ContactInfo = {
      name: target.name.value,
      email: target.email.value,
      phone: target.phone.value,
      address: target.address.value,
      message: target.message.value
    };

    onSendRequest(contactInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Consult an Expert</h2>
            <p className="text-slate-500 text-sm mt-1">
              {selectedDesign ? `Get help building the "${selectedDesign.style}" plan.` : "Get a professional review."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">

          {selectedDesign && (
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
              <LayoutTemplate size={18} className="text-purple-600 shrink-0" />
              <div className="text-xs text-purple-800">
                <strong>Attached:</strong> {selectedDesign.title} ({selectedDesign.style})<br />
                <span className="opacity-75">Est: {selectedDesign.cost_breakdown?.total_range}</span>
              </div>
            </div>
          )}

          {intakeData && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
              <FileText size={18} className="text-blue-600 shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Attached:</strong> Project Intake (12 Points)
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required name="name" type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="John Doe" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required name="email" type="email" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required name="phone" type="tel" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="(310) 555-0123" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input required name="address" type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/20 transition-all" placeholder="123 Sunset Blvd, LA" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</label>
            <textarea name="message" required rows={3} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none" placeholder="I'm ready to start, please review my scope..." />
          </div>

          <button type="submit" className="w-full bg-[#0f172a] hover:bg-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200">
            Send Request & Data <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}