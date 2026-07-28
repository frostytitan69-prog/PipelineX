import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/ui/Loader';
import type { Role } from '../types';

export interface ProtectedRouteProps {
  requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-zinc-400">
        <Loader size="lg" />
        <span className="text-xs mt-2">Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center text-zinc-100">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <span className="text-3xl font-extrabold">403</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Forbidden</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          You do not have permission to access this administrative console. Required role: <strong>{requiredRole}</strong>.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <Outlet />;
};
