import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = [
    { icon: '🏠', label: 'Explore', path: '/' },
    { icon: '➕', label: 'Post', path: '/post' }, // path for Post is just a placeholder
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (label: string, path: string) => {
    if (label === 'Profile') {
      navigate('/profile');
    } else if (label === 'Explore') {
      navigate('/');
    } else {
      // Add navigation logic for other buttons if needed
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const isActive =
            (item.label === 'Explore' && location.pathname === '/feed') ||
            (item.label === 'Profile' && location.pathname.startsWith('/profile')) ||
            (item.label === 'Notifications' && location.pathname.startsWith('/notifications'));
          return (
            <button
              key={item.label}
              className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
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