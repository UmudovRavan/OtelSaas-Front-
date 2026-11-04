import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, getDefaultRouteForRole } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // SuperAdmin has access to all panels
  if (user.role === 'SuperAdmin') {
    return children;
  }

  // Check if user's role is in allowed list
  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own authorized home page
    const userDefaultHome = getDefaultRouteForRole(user.role);
    return <Navigate to={userDefaultHome} replace />;
  }

  return children;
};

