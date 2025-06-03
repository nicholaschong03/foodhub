import React, { useState } from 'react';
import logoOrange from '../../assets/logo_orange_cropped.png';
import DefaultProfileIcon from './DefaultProfileIcon';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate getting user info (replace with real user context or prop in production)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20 md:left-64 h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Logo and Brand Name */}
        <div className="flex items-center">
          <div className="h-12 w-12 flex items-center justify-center">
            <img src={logoOrange} alt="Foodhub Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold ml-2">
            Foodhub
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-3">
          <div className="relative">
            <input
              type="text"
              placeholder="What's on your mind?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white border border-orange-200"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Logout Button */}
          <button
            className="hidden md:block text-gray-600 hover:text-red-500"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
          >
            Logout
          </button>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-orange-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
              <DefaultProfileIcon className="text-orange-400" size={20} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;