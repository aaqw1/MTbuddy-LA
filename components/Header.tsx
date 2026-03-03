'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import ConsultModal from './ConsultModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Adjust offset for sticky header height (approx 100px) to ensure title isn't covered
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleSendRequest = (contactInfo: any) => {
    console.log("Global consult request:", contactInfo);

    const subject = `General Consultation Request: ${contactInfo.name}`;
    const body = `Name: ${contactInfo.name}
Email: ${contactInfo.email}
Phone: ${contactInfo.phone}
Address: ${contactInfo.address}

Message:
${contactInfo.message}
`;

    alert("Consultation request sent! Redirecting to email client...");
    window.location.href = `mailto:mz2821@columbia.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300">
        {/* Glass Background for Header */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm z-0"></div>

        {/* Grid Layout: 3 columns (Left, Center-Auto, Right) ensures no overlap */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">

          {/* Logo Section (Left) */}
          <div className="flex justify-start">
            <Link href="/" className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">MTBuddy</span> LA
            </Link>
          </div>

          {/* Navigation Section (Center) - Auto width, perfectly centered by grid structure */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 justify-center">
            <Link
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-blue-600 transition-colors py-2 whitespace-nowrap"
            >
              How it Works
            </Link>
            <Link
              href="#guides"
              onClick={(e) => scrollToSection(e, 'guides')}
              className="hover:text-blue-600 transition-colors py-2 whitespace-nowrap"
            >
              Popular Guides
            </Link>
          </nav>

          {/* Action Button Section (Right) */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Consult an Expert
            </button>
          </div>

        </div>
      </header>

      <ConsultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendRequest={handleSendRequest}
      />
    </>
  );
}