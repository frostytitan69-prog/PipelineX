import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 shadow-xl animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-3 w-24 bg-zinc-800 rounded" />
      <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
    </div>
    <div className="mt-4 h-7 w-20 bg-zinc-800 rounded" />
    <div className="mt-2 h-3 w-16 bg-zinc-800 rounded" />
  </div>
);

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 shadow-xl animate-pulse space-y-4">
    <div className="h-5 w-48 bg-zinc-800 rounded mb-4" />
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="h-10 w-full bg-zinc-800/60 rounded" />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ cols?: number; rows?: number }> = ({ cols = 5, rows = 5 }) => (
  <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#18181B] animate-pulse">
    <div className="h-12 bg-[#111111] border-b border-[#27272A]" />
    <div className="divide-y divide-[#27272A] p-4 space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center py-2">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="h-4 flex-1 bg-zinc-800/70 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
);
