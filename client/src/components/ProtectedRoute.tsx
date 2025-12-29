import React from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/cms/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
