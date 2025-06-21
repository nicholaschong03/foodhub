import React, { useEffect, useRef, useState } from 'react';
// import welcomeImg from '../../assets/welcome_carousel.png';
// import welcomeImg1 from '../../assets/welcome_carousel1.png';
// import welcomeImg2 from '../../assets/welcome_carousel2.png';
// import welcomeImg3 from '../../assets/welcome_carousel3.png';

const welcomeImg = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516314/welcome_carousel_rku4q0.png'
const welcomeImg1 = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516313/welcome_carousel1_pdyxkj.png'
const welcomeImg2 = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516315/welcome_carousel2_gpjcrn.png'
const welcomeImg3 = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516314/welcome_carousel_rku4q0.png'

interface Slide {
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const slides: Slide[] = [
  {
    title: 'Welcome to Foodhub',
    description: 'Discover and share the best food experiences',
    illustration: (
      <img
        src={welcomeImg}
        alt="Welcome Illustration"
        className="w-80 h-80 object-contain mb-8"
      />
    ),
  },
  {
    title: 'Personalized AI Food Recommendations',
    description: 'Discover meals tailored to your dietary needs and taste preferences using AI-powered recommendations.',
    illustration: (
      <img
        src={welcomeImg1}
        alt="Welcome Illustration"
        className="w-80 h-80 object-contain mb-8"
      />
    ),
  },
  {
    title: 'Scan Food to Get Nutrition Info',
    description: 'Just snap a picture to reveal calories, nutrients, and dish insights with real-time food recognition',
    illustration: (
      <img
        src={welcomeImg2}
        alt="Welcome Illustration"
        className="w-80 h-80 object-contain mb-8"
      />
    ),
  },
  {
    title: 'Honest Reviews, Smarter Choices',
    description: 'Get AI-analyzed reviews based on real customer opinions about taste, service, and ambiance',
    illustration: (
      <img
        src={welcomeImg3}
        alt="Welcome Illustration"
        className="w-80 h-80 object-contain mb-8"
      />
    ),
  },
];

const WelcomeCarousel: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll logic
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current]);

  // Manual navigation
  const goTo = (idx: number) => {
    setCurrent(idx);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white px-6">
      <div className="relative w-full max-w-md mx-auto overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out min-w-0"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="w-full flex-shrink-0 flex flex-col items-center justify-center"
              style={{ minHeight: '400px' }}
            >
              {slide.illustration}
              <h2
                className="text-2xl font-bold text-center mb-2"
                style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 700 }}
              >
                {slide.title}
              </h2>
              <p
                className="text-gray-600 text-center mb-4 max-w-md mx-auto break-words"
                style={{ fontFamily: 'Google Sans, sans-serif', fontWeight: 500 }}
              >
                {slide.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Dots indicator */}
      <div className="flex items-center justify-center mb-4 mt-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-1 rounded-full mx-1 inline-block transition-all duration-300 ${
              idx === current ? 'bg-orange-500 w-4' : 'bg-orange-200'
            }`}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      <button
        className="w-full max-w-xs py-3 rounded-lg text-white font-semibold text-lg"
        style={{ background: 'linear-gradient(90deg, #FF6A00 0%, #FF8C1A 100%)' }}
        onClick={onGetStarted}
      >
        Get started &rarr;
      </button>
    </div>
  );
};

export default WelcomeCarousel;