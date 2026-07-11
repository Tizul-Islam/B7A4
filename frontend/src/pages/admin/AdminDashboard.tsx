import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Users, ShoppingBag, Layers } from 'lucide-react';
import { api } from '../../api';

export const AdminDashboard: React.FC = () => {
  // Fetch Stats Data
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.admin.stats(),
  });

  const stats = statsData?.data || {
    totalRevenue: 0,
    totalUsers: 0,
    totalGearItems: 0,
    totalRentalOrders: 0,
    ordersByStatus: {},
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Platform Overview</h1>
        <p className="text-sm text-slate-400">Moderation and aggregated analytics dashboard</p>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xxs font-black uppercase tracking-wider text-slate-500 block">Total Revenue</span>
            <span className="font-display text-2xl font-black text-emerald-400 mt-1 block">
              ${Number(stats.totalRevenue).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-950 text-accentTeal border border-sky-800/40">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xxs font-black uppercase tracking-wider text-slate-500 block">Platform Users</span>
            <span className="font-display text-2xl font-black text-white mt-1 block">
              {stats.totalUsers}
            </span>
          </div>
        </div>

        {/* Gears */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-950 text-accentOrange border border-orange-800/40">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xxs font-black uppercase tracking-wider text-slate-500 block">Listed Equipments</span>
            <span className="font-display text-2xl font-black text-white mt-1 block">
              {stats.totalGearItems}
            </span>
          </div>
        </div>

        {/* Rentals */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-xxs font-black uppercase tracking-wider text-slate-500 block">Total Bookings</span>
            <span className="font-display text-2xl font-black text-white mt-1 block">
              {stats.totalRentalOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Distribution */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md space-y-6">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Fulfillment Status Distribution</h2>
          <p className="text-xs text-slate-400 mt-1">Platform-wide overview of rental lifecycle stages</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(
            [
              ['PLACED', 'Placed (Awaiting Confirm)', 'bg-slate-700', 'text-slate-400'],
              ['CONFIRMED', 'Confirmed (Unpaid)', 'bg-blue-600', 'text-blue-400'],
              ['PAID', 'Paid (Awaiting Pickup)', 'bg-emerald-600', 'text-emerald-400'],
              ['PICKED_UP', 'Picked Up (Active Rental)', 'bg-indigo-600', 'text-indigo-400'],
              ['RETURNED', 'Returned (Completed)', 'bg-teal-600', 'text-teal-400'],
              ['CANCELLED', 'Cancelled', 'bg-rose-600', 'text-rose-400'],
            ] as const
          ).map(([status, label, color, text]) => {
            const count = stats.ordersByStatus?.[status] || 0;
            const percentage = stats.totalRentalOrders > 0
              ? (count / stats.totalRentalOrders) * 100
              : 0;

            return (
              <div key={status} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">{label}</span>
                  <span className={`font-mono font-black ${text}`}>{count}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className={`${color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
