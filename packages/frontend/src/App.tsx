import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import AuthScreen from './components/auth/AuthScreen';
import CreateAccountModal from './components/auth/CreateAccountModal';
import HomeScreen from './components/home/HomeScreen';
import UserProfileScreen from './components/profile/UserProfileScreen';
import NotFoundScreen from './components/common/NotFoundScreen';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  let userId: string | null = null;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    userId = user.id || user._id || null;
  } catch (e) {
    userId = null;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/auth/login" element={<AuthScreen />} />
        <Route path="/auth/register" element={<CreateAccountModal />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <HomeScreen>
                <UserProfileScreen />
              </HomeScreen>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </Router>
  );
}

export default App;