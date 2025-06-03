import React, { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';
import WelcomeCarousel from './WelcomeCarousel';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setSplashFadeOut(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (splashFadeOut) {
      const timeout = setTimeout(() => setShowSplash(false), 500); // match fade duration
      return () => clearTimeout(timeout);
    }
  }, [splashFadeOut]);

  return (
    <div className="relative min-h-screen">
      <WelcomeCarousel onGetStarted={() => navigate('/auth/login')} />
      {showSplash && (
        <div
          className={`absolute inset-0 z-50 transition-opacity duration-500 ${
            splashFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <SplashScreen />
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;