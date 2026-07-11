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
    totalRentals: 0,
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
              {stats.totalRentals}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
