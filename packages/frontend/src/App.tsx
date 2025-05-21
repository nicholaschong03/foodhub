import { useEffect, useState } from 'react'
import SplashScreen from './components/SplashScreen'
import WelcomeScreen from './components/WelcomeScreen'
import AuthScreen from './components/AuthScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadeOut, setSplashFadeOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeFadeIn, setWelcomeFadeIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

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
    // TODO: Handle successful authentication
    alert('Authenticated!')
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
  return null
}

export default App