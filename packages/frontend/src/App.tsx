import { useEffect, useState } from 'react'
import SplashScreen from './components/SplashScreen'
import WelcomeScreen from './components/WelcomeScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFadeOut, setSplashFadeOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeFadeIn, setWelcomeFadeIn] = useState(false)

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
    // TODO: Navigate to next onboarding/auth screen
    alert('Get started clicked!')
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
  return null
}

export default App