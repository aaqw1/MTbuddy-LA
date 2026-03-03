import React from 'react';
import { Settings } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements matching the style */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
         <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-40 left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
         {/* Subtle Wave lines */}
         <svg className="absolute top-1/4 left-0 w-full opacity-20" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke="#6366f1" strokeWidth="2" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192"></path>
         </svg>
      </div>

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 p-6 z-50">
        <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full inline-block w-max">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-full shadow-md">
            <Settings className="text-white" size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">MTBuddy LA</span>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-grow flex flex-col justify-center container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-slate-400 text-xs pointer-events-none">
        <p>Powered by LADBS Public Data. AI can make mistakes.</p>
      </footer>
    </div>
  );
}

export default Layout;