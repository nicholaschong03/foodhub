import { useEffect, useState } from 'react'
import SplashScreen from './components/welcome/SplashScreen'
import WelcomeScreen from './components/welcome/WelcomeScreen'
import AuthScreen from './components/auth/AuthScreen'
import HomeScreen from './components/home/HomeScreen'
import UserProfileScreen from './components/profile/UserProfileScreen'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'

function AppRoutes({ userId }: { userId: string | null }) {
  return (
    <Routes>
      <Route path="/feed" element={<HomeScreen />} />
      {userId && <Route path="/profile" element={<HomeScreen><UserProfileScreen userId={userId} /></HomeScreen>} />}
      <Route path="/" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}

function AppInner() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadeOut, setSplashFadeOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeFadeIn, setWelcomeFadeIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showHome, setShowHome] = useState(false)
  const navigate = useNavigate();

  // Get userId from localStorage
  let userId: string | null = null;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userId = user.id || user._id || null;
  } catch (e) {
    userId = null;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFadeOut(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (splashFadeOut) {
      const timeout = setTimeout(() => {
        setShowSplash(false)
        setShowWelcome(true)
        setTimeout(() => setWelcomeFadeIn(true), 10)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [splashFadeOut])

  const handleGetStarted = () => {
    setShowWelcome(false)
    setShowAuth(true)
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    setShowHome(true)
    navigate('/feed'); // Always go to feed after login
  }

  if (showSplash) {
    return (
      <div className={`transition-opacity duration-500 ${splashFadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <SplashScreen />
      </div>
    )
  }
  if (showWelcome) {
    return (
      <div className={`transition-opacity duration-500 ${welcomeFadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <WelcomeScreen onGetStarted={handleGetStarted} />
      </div>
    )
  }
  if (showAuth) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }
  if (showHome) {
    return <AppRoutes userId={userId} />;
  }
  return null
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App