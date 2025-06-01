import React from 'react';
import Header from './Header';
import DesktopNavigation from '../home/components/DesktopNavigation';
import MobileNavigation from '../home/components/MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
          <Header />
          <main className="pt-16">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <Header />
        <main className="pt-16 pb-20">
          {children}
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
};

export default Layout;