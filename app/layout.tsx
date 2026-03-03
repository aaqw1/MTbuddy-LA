import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | LA Permit Copilot',
    default: 'LA Permit Copilot - AI for Bathroom Remodels',
  },
  description: 'Instant answers for Los Angeles bathroom remodel permits, plan check requirements, and inspection checklists. Grounded in LADBS data.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://la-permit-copilot.vercel.app',
    siteName: 'LA Permit Copilot',
    title: 'LA Permit Copilot',
    description: 'Simplify your LADBS permit process with AI.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}