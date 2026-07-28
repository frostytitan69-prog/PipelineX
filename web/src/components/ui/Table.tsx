import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-[#27272A] bg-[#18181B] ${className}`}>
      <table className="w-full text-left text-sm text-zinc-300">
        <thead className="bg-[#111111] text-xs uppercase tracking-wider text-zinc-400 border-b border-[#27272A]">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-5 py-3.5 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#27272A]">{children}</tbody>
      </table>
    </div>
  );
};
