import ChatInterface from '@/components/ChatInterface';
import HomeSEO from '@/components/HomeSEO';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LA PermitCoach - AI for Bathroom Remodels',
  description: 'Your AI permit coach for Los Angeles bathroom remodels. Get checklists, inspection tips, and code requirements instantly.',
};

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      {/* Hero / Chat Section */}
      <ChatInterface />

      {/* SEO / Info / FAQ Content Section */}
      <HomeSEO />
    </div>
  );
}