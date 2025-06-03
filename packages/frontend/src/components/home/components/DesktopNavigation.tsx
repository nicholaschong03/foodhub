import React, { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import { useNavigate, useLocation } from 'react-router-dom';

const DesktopNavigation: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = [
    { icon: '🏠', label: 'Explore', path: '/feed' },
    { icon: '➕', label: 'Post', path: '/post' }, // path for Post is just a placeholder
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  // More button is not active by default
  const moreButtonActive = false;

  const handleNavClick = (label: string, path: string) => {
    if (label === 'Post') {
      setIsModalOpen(true);
    } else if (label === 'Profile') {
      navigate('/profile');
    } else if (label === 'Explore') {
      navigate('/feed');
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <nav className="h-full bg-white relative">
        <div className="p-4 pb-20">
          {/* Main Navigation */}
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                (item.label === 'Explore' && location.pathname === '/feed') ||
                (item.label === 'Profile' && location.pathname.startsWith('/profile')) ||
                (item.label === 'Notifications' && location.pathname.startsWith('/notifications'));
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
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
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              moreButtonActive
                ? 'bg-orange-50 text-orange-500'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500'
            }`}
          >
            <span className="text-xl">≡</span>
            <span className="text-sm">More</span>
          </button>
        </div>
      </nav>
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default DesktopNavigation;