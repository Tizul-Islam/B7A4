import React from 'react';

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    PLACED: 'bg-slate-800 text-slate-300 border border-slate-700',
    CONFIRMED: 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50',
    PAID: 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50',
    PICKED_UP: 'bg-purple-900/40 text-purple-300 border border-purple-800/50',
    RETURNED: 'bg-teal-900/40 text-teal-300 border border-teal-800/50',
    CANCELLED: 'bg-rose-900/40 text-rose-300 border border-rose-800/50',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-800 text-slate-300'}`}>
      {status}
    </span>
  );
};
