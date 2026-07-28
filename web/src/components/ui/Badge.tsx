import React from 'react';

export interface BadgeProps {
  variant?: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'USER' | 'ADMIN' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    UPLOADED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    USER: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
