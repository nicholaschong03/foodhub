import React, { useState } from 'react';
import logoOrange from '../assets/logo_orange.png';
import CreateAccountModal from './CreateAccountModal';

const AuthScreen: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    onAuthSuccess();
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google authentication
    alert('Google sign-in');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white px-6">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg p-8 shadow-md ">
      <img src={logoOrange} alt="Foodhub Logo" className="w-48 h-48 object-contain mx-auto absolute left-1/2 -translate-x-1/2 -top-1 z-10" />        <h2 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700 }}>
          {isLogin ? 'Login to Foodhub' : 'Sign up for Foodhub'}
        </h2>
        <p className="text-gray-600 text-center mb-6" style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 500 }}>
          Get started with your food discovery journey
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold text-lg mt-2"
            style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
          >
            {isLogin ? 'Login' : 'Sign up'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition mb-2"
          onClick={handleGoogleAuth}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M23.766 12.276c0-.818-.074-1.604-.213-2.356H12.24v4.451h6.484c-.28 1.51-1.12 2.788-2.384 3.646v3.022h3.858c2.262-2.084 3.568-5.156 3.568-8.763z" fill="#4285F4"/>
              <path d="M12.24 24c3.24 0 5.963-1.07 7.95-2.91l-3.858-3.022c-1.07.72-2.44 1.15-4.092 1.15-3.146 0-5.81-2.127-6.77-4.988H1.47v3.09A11.997 11.997 0 0012.24 24z" fill="#34A853"/>
              <path d="M5.47 14.23A7.19 7.19 0 014.6 12c0-.778.134-1.532.37-2.23V6.68H1.47A11.997 11.997 0 000 12c0 1.885.453 3.667 1.47 5.32l4-3.09z" fill="#FBBC05"/>
              <path d="M12.24 4.77c1.764 0 3.34.607 4.584 1.8l3.43-3.43C18.2 1.07 15.48 0 12.24 0A11.997 11.997 0 001.47 6.68l4 3.09c.96-2.86 3.624-4.99 6.77-4.99z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <path fill="#fff" d="M0 0h24v24H0z"/>
              </clipPath>
            </defs>
          </svg>
          Continue with Google
        </button>
        <div className="text-center mt-4">
          <button
            className="text-orange-500 font-semibold hover:underline"
            onClick={() => setShowCreateModal(true)}
          >
            {"Don't have an account? Sign up"}
          </button>
        </div>
      </div>
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onNext={(data) => {
            setShowCreateModal(false);
            // Optionally, handle next onboarding step with data
          }}
        />
      )}
    </div>
  );
};

export default AuthScreen;