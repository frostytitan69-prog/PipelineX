import React from 'react';
import { NavLink } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">
        The requested pipeline route does not exist or has been relocated.
      </p>
      <NavLink to="/dashboard">
        <Button variant="primary" size="md">
          <ArrowLeft className="w-4 h-4" /> Return to Console
        </Button>
      </NavLink>
    </div>
  );
};
