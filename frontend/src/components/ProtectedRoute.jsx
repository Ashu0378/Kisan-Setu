import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout } from 'lucide-react';

/**
 * Wraps any route that requires authentication.
 * - Shows a loading spinner while the token is being validated on first load.
 * - Redirects unauthenticated users to /signin, preserving the intended path.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg animate-pulse">
          <Sprout className="w-8 h-8 text-white" />
        </div>
        <p className="text-brand-600 font-medium text-sm animate-pulse">Loading KisanSetu…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
