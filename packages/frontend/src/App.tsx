import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import AuthScreen from './components/auth/AuthScreen';
import CreateAccountModal from './components/auth/CreateAccountModal';
import HomeScreen from './components/home/HomeScreen';
import UserProfileScreen from './components/profile/UserProfileScreen';
import NotFoundScreen from './components/common/NotFoundScreen';
import ProtectedRoute from './components/common/ProtectedRoute';
import { checkAuthStatus, User } from './services/auth.service';
import Loading from './components/common/Loading';
import OtherUserProfileScreen from './components/profile/OtherUserProfileScreen';
import ExploreScreen from './components/home/components/ExploreScreen';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const userData = await checkAuthStatus();
      setUser(userData);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={
            user ? <Navigate to="/feed" replace /> : <WelcomeScreen />
          } />
          <Route path="/auth/login" element={
            user ? <Navigate to="/feed" replace /> : <AuthScreen />
          } />
          <Route path="/auth/register" element={
            user ? <Navigate to="/feed" replace /> : <CreateAccountModal />
          } />

          {/* Protected routes */}
          <Route path="/feed" element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <HomeScreen>
                <UserProfileScreen />
              </HomeScreen>
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={
            <ProtectedRoute>
              <HomeScreen>
                <OtherUserProfileScreen />
              </HomeScreen>
            </ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute>
              <ExploreScreen />
            </ProtectedRoute>
          } />

          {/* Redirect root to feed if authenticated, welcome if not */}
          <Route path="/" element={
            user ? <Navigate to="/feed" replace /> : <Navigate to="/welcome" replace />
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;