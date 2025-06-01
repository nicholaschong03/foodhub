import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const navigationItems = [
    { icon: '🏠', label: 'Explore', active: true },
    { icon: '➕', label: 'Post', active: false },
    { icon: '🔔', label: 'Notifications', active: false },
    { icon: '👤', label: 'Profile', active: false },
  ];

  const handleNavClick = (label: string) => {
    if (label === 'Profile') {
      navigate('/profile');
    }
    // Add navigation logic for other buttons if needed
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center space-y-1 py-2 px-3 transition-colors ${
              item.active ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
            }`}
            onClick={() => handleNavClick(item.label)}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;