import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendType = 'positive',
}) => {
  const trendColors = {
    positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    negative: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    neutral: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  };

  return (
    <Card hoverEffect className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{title}</span>
        <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-blue-400">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-xs text-zinc-500">{description}</p>}
    </Card>
  );
};
