import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavigationProps {
  onPostClick?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onPostClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = [
    { icon: '🏠', label: 'Feed', path: '/feed' },
    { icon: '➕', label: 'Post', path: '/post' }, // path for Post is just a placeholder
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive =
            (item.label === 'Feed' && location.pathname === '/feed') ||
            (item.label === 'Profile' && location.pathname === '/profile') ||
            (item.label === 'Explore' && location.pathname === '/explore');
          return (
            <button
              key={item.label}
              className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                }`}
              onClick={() => handleNavClick(item.label, item.path)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;