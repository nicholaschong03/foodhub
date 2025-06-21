import React from 'react';
import Header from './Header';
import DesktopNavigation from '../home/components/DesktopNavigation';
import MobileNavigation from '../home/components/MobileNavigation';
import CreatePostModal from '../home/components/CreatePostModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Left Navigation Panel */}
        <div className="w-64 bg-white shadow-sm fixed left-0 top-0 h-full z-10">
          <DesktopNavigation />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          <Header onPostSelect={() => setIsPostModalOpen(true)} />
          <main className="pt-16">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <Header onPostSelect={() => setIsPostModalOpen(true)} />
        <main className="pt-16 pb-20">
          {children}
        </main>
        <MobileNavigation onPostClick={() => setIsPostModalOpen(true)} />
        <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} />
      </div>
    </div>
  );
};

export default Layout;