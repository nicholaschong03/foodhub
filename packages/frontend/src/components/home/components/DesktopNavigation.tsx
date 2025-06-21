import React, { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import MoreModal from '../../common/MoreModal';
import { useNavigate, useLocation } from 'react-router-dom';

const DesktopNavigation: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = [
    { icon: '🏠', label: 'Feed', path: '/feed' },
    { icon: '➕', label: 'Post', path: '/post' }, // path for Post is just a placeholder
    { icon: '📍', label: 'Explore', path: '/explore' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  // More button is not active by default
  const moreButtonActive = false;

  const handleNavClick = (label: string, path: string) => {
    if (label === 'Post') {
      setIsModalOpen(true);
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

  return (
    <>
      <nav className="h-full bg-white dark:bg-gray-900 relative">
        <div className="p-4 pb-20">
          {/* Main Navigation */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                (item.label === 'Feed' && location.pathname === '/feed') ||
                (item.label === 'Profile' && location.pathname === '/profile') ||
                (item.label === 'Explore' && location.pathname === '/explore');
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500'
                    }`}
                  onClick={() => handleNavClick(item.label, item.path)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* More Button at the bottom */}
        <div className="absolute bottom-0 left-0 w-full p-4">
          <button
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${moreButtonActive
              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'
              : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500'
              }`}
            onClick={() => setIsMoreModalOpen(true)}
          >
            <span className="text-xl">≡</span>
            <span className="text-sm">More</span>
          </button>
        </div>
      </nav>
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <MoreModal isOpen={isMoreModalOpen} onClose={() => setIsMoreModalOpen(false)} />
    </>
  );
};

export default DesktopNavigation;