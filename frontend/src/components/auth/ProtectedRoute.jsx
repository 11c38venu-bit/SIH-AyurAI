import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/authContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, role, loading } = useAuth();
  const location = useLocation();

  // Loading state while verifying token with backend /auth/me
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-ayur-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // If no JWT token or no authenticated user, redirect to login
  if (!token || !user) {
    const currentPath = location.pathname + location.search;
    const redirectParam = encodeURIComponent(currentPath);
    const roleParam = requiredRole ? `&role=${requiredRole.toLowerCase()}` : '';
    return <Navigate to={`/login?redirect=${redirectParam}${roleParam}`} replace />;
  }

  // If a specific role is required, enforce role-based access control
  if (requiredRole) {
    const activeRole = (user.role || role || '').toLowerCase();
    const targetRole = requiredRole.toLowerCase();

    if (activeRole !== targetRole) {
      // Authenticated with a different role: redirect safely to own portal
      if (activeRole === 'doctor') return <Navigate to="/doctor" replace />;
      if (activeRole === 'staff') return <Navigate to="/staff" replace />;
      if (activeRole === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
