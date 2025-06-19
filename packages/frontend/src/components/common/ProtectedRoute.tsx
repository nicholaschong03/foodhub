import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUser } from '../../services/auth.service';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}