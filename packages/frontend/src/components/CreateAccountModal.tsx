import React, { useState } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CreateAccountModal: React.FC<{ onClose: () => void; onNext: (data: { name: string; email: string; password: string }) => void }> = ({ onClose, onNext }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isEmailValid = emailRegex.test(email);
  const isDisabled = !name || !email || !password || !isEmailValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      onNext({ name, email, password });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Close button */}
        <button
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &larr;
        </button>
        <form onSubmit={handleSubmit} className="pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Add contact details</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            {!isEmailValid && email && (
              <span className="text-xs text-red-500 mt-1 block">Please enter a valid email address.</span>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Set your password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
            disabled={isDisabled}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;