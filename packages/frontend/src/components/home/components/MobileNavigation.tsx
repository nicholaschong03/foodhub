import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AIFoodScannerModal from './AIFoodScannerModal';
import AIFoodResultsModal from './AIFoodResultsModal';

interface MobileNavigationProps {
  onPostClick?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onPostClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAIFoodScannerOpen, setIsAIFoodScannerOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const navigationItems = [
    { icon: '🏠', label: 'Feed', path: '/feed' },
    { icon: '➕', label: 'Post', path: '/post' },
    { icon: '📍', label: 'Explore', path: '/explore' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (label: string, path: string) => {
    if (label === 'Post' && onPostClick) {
      onPostClick();
    } else if (label === 'Profile') {
      navigate('/profile');
    } else if (label === 'Feed') {
      navigate('/feed');
    } else if (label === 'Explore') {
      navigate('/explore');
    } else {
      navigate(path);
    }
  };

  const handleAIFoodScannerClick = () => {
    setIsAIFoodScannerOpen(true);
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setIsResultsOpen(true);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-20">
      <div className="flex items-center justify-around py-2 relative">
        {/* Feed */}
        <button
          className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${location.pathname === '/feed' ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}
          onClick={() => handleNavClick('Feed', '/feed')}
        >
          <span className="text-lg">🏠</span>
          <span className="text-xs">Feed</span>
        </button>
        {/* Post */}
        <button
          className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${location.pathname === '/post' ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}
          onClick={() => handleNavClick('Post', '/post')}
        >
          <span className="text-lg">➕</span>
          <span className="text-xs">Post</span>
        </button>
        {/* AI Food Scanner (center, protruding) */}
        <button
          className="absolute left-1/2 -translate-x-1/2 -top-6 bg-orange-500 text-white rounded-full shadow-lg w-16 h-16 flex flex-col items-center justify-center border-4 border-white dark:border-gray-900 z-30"
          style={{ boxShadow: '0 4px 16px rgba(255, 165, 0, 0.3)' }}
          onClick={handleAIFoodScannerClick}
        >
          <span className="text-2xl">🤖</span>
          <span className="text-xs font-semibold mt-1">Scan</span>
        </button>
        {/* Explore */}
        <button
          className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${location.pathname === '/explore' ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}
          onClick={() => handleNavClick('Explore', '/explore')}
        >
          <span className="text-lg">📍</span>
          <span className="text-xs">Explore</span>
        </button>
        {/* Profile */}
        <button
          className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${location.pathname === '/profile' ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400'}`}
          onClick={() => handleNavClick('Profile', '/profile')}
        >
          <span className="text-lg">👤</span>
          <span className="text-xs">Profile</span>
        </button>
      </div>

      {/* AI Food Scanner Modal */}
      <AIFoodScannerModal
        isOpen={isAIFoodScannerOpen}
        onClose={() => setIsAIFoodScannerOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* AI Food Results Modal */}
      {analysisResults && (
        <AIFoodResultsModal
          isOpen={isResultsOpen}
          onClose={() => setIsResultsOpen(false)}
          results={analysisResults}
        />
      )}
    </nav>
  );
};

export default MobileNavigation;