import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, group, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-brand-black">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Authenticating...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to Landing
  if (!user || !group) {
    return <Navigate to="/" replace />;
  }

  // If user hasn't submitted setup, force them to setup page
  if (!user.hasSubmitted && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If user HAS submitted and tries to go to setup, send to dashboard
  if (user.hasSubmitted && location.pathname === '/setup') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin access check
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
