import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'severity' | 'status' | 'default';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'status', className = '' }) => {
  const s = status.toUpperCase();

  let colorClasses = 'text-slate-400 border-slate-700 bg-slate-900/60';
  let dotColor = 'bg-slate-500';

  if (s === 'CRITICAL' || s === 'OUT_OF_STOCK' || s === 'CANCELLED') {
    colorClasses = 'text-rose-400 border-rose-800/80 bg-rose-950/40';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (s === 'HIGH' || s === 'LOW_STOCK' || s === 'EN_ROUTE' || s === 'STAGING') {
    colorClasses = 'text-amber-400 border-amber-800/80 bg-amber-950/40';
    dotColor = 'bg-amber-500';
  } else if (s === 'ACTIVE' || s === 'IN_STOCK' || s === 'COMPLETED' || s === 'RESOLVED' || s === 'AVAILABLE') {
    colorClasses = 'text-emerald-400 border-emerald-800/80 bg-emerald-950/40';
    dotColor = 'bg-emerald-500';
  } else if (s === 'DISPATCHED' || s === 'DEPLOYED' || s === 'VERIFIED') {
    colorClasses = 'text-cyan-400 border-cyan-800/80 bg-cyan-950/40';
    dotColor = 'bg-cyan-500';
  } else if (s === 'PENDING' || s === 'TRIAGED' || s === 'REPORTED') {
    colorClasses = 'text-violet-400 border-violet-800/80 bg-violet-950/40';
    dotColor = 'bg-violet-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${colorClasses} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
