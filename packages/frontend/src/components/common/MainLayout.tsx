import React from 'react';
import Header from './Header';
import DesktopNavigation from '../home/components/DesktopNavigation';
import MobileNavigation from '../home/components/MobileNavigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white dark:bg-gray-900 shadow-sm fixed left-0 top-0 h-full z-10">
        <DesktopNavigation />
      </div>
      {/* Main Area */}
      <div className="flex flex-col flex-1 h-screen md:ml-64">
        <Header onPostSelect={() => { }} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + (children && (children as any).type?.name ? (children as any).type.name : '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;