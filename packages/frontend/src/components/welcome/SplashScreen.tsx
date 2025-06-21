import React, { useEffect } from 'react';
// import logo from '../../assets/splash_screen_logo.png';
import { useNavigate } from 'react-router-dom';

const logo = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516312/splash_screen_logo_lxltrl.png'

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full" style={{ background: 'linear-gradient(180deg, #FF6A00 0%, #FF8C1A 100%)' }}>
      {/* Logo image, no circle */}
      <img src={logo} alt="Foodhub Logo" className="w-96 h-96 object-contain mb-8" />
      {/* <h1 className="text-white text-3xl font-bold tracking-wide">Foodhub</h1> */}
    </div>
  );
};

export default SplashScreen;