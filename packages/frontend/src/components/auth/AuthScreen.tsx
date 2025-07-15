import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const logoOrange = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516307/logo_orange_rf4tri.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      // The login service handles storing the token and user data.
      // Navigate to feed
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white px-6">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg p-8 shadow-md">
        <img src={logoOrange} alt="Foodhub Logo" className="w-48 h-48 object-contain mx-auto absolute left-1/2 -translate-x-1/2 -top-1 z-10" />
        <h2 className="text-2xl font-bold text-center mb-3 mt-20" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700 }}>
          Login to Foodhub
        </h2>
        <p className="text-gray-600 text-center mb-6" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 500 }}>
          Get started with your food discovery journey
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold text-lg mt-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <button
          className="w-full py-3 rounded-lg font-semibold text-lg mt-2 border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 transition disabled:opacity-50"
          onClick={() => navigate('/auth/register')}
          disabled={isLoading}
        >
          Sign up
        </button>
        <div className="text-center mt-4">
          <button
            className="text-orange-500 font-semibold hover:underline"
            onClick={() => navigate('/auth/register')}
            disabled={isLoading}
          >
            {"Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;