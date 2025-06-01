import React from 'react';
import WelcomeCarousel from './WelcomeCarousel';

const WelcomeScreen: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <WelcomeCarousel onGetStarted={onGetStarted} />
);

export default WelcomeScreen;