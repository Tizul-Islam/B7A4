import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';

export const AdminGear: React.FC = () => {
  // Fetch All Platform Gear Listings
  const { data: gearData, isLoading } = useQuery({
    queryKey: ['adminGear'],
    queryFn: () => api.admin.gear(),
  });

  const listings = gearData?.data || [];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Platform Equipment listings</h1>
        <p className="text-sm text-slate-400">Read-only auditing view of all listings created by providers</p>
      </div>

      <DataTable
        headers={['Name', 'Brand', 'Daily Price', 'Available Stock', 'Condition', 'Provider ID']}
        data={listings}
        loading={isLoading}
        emptyMessage="No equipment listings registered on the platform yet."
        renderRow={(gear: any) => (
          <tr key={gear.id}>
            <td className="px-6 py-4 font-display text-sm font-bold text-white">{gear.name}</td>
            <td className="px-6 py-4 text-sm text-slate-300">{gear.brand}</td>
            <td className="px-6 py-4 font-display text-sm font-extrabold text-white">
              ${Number(gear.pricePerDay).toFixed(2)}
            </td>
            <td className="px-6 py-4 text-sm text-slate-300 font-semibold">
              {gear.availableQuantity} / {gear.stockQuantity}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wide border shadow-sm ${
                gear.condition === 'NEW'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : gear.condition === 'GOOD'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}>
                {gear.condition}
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-mono text-slate-500">
              {gear.providerId}
            </td>
          </tr>
        )}
      />
    </div>
  );
};
export default AdminGear;
