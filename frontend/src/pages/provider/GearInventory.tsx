import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/DataTable';
import { toast } from 'sonner';

export const GearInventory: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch Gear Items
  const { data: gearsData, isLoading } = useQuery({
    queryKey: ['providerGears'],
    queryFn: () => api.gear.list(),
  });

  // Filter items matching the provider
  const inventory = gearsData?.data
    ? gearsData.data.filter((item: any) => item.providerId === user?.id)
    : [];

  // Delete Gear Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.gear.providerDelete(id),
    onSuccess: () => {
      toast.success('Equipment listing deleted.');
      queryClient.invalidateQueries({ queryKey: ['providerGears'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete gear item.');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this gear listing?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Gear Inventory</h1>
          <p className="text-sm text-slate-400">List and manage equipment you are lending on the marketplace</p>
        </div>
        
        <Link
          to="/provider/gear/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accentTeal px-4 py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover shadow-lg shadow-sky-500/20"
        >
          <PlusCircle size={16} /> List Equipment
        </Link>
      </div>

      <DataTable
        headers={['Name', 'Brand', 'Daily Price', 'Available Stock', 'Condition', 'Actions']}
        data={inventory}
        loading={isLoading}
        emptyMessage="No equipment listed in your inventory yet."
        renderRow={(gear: any) => (
          <tr key={gear.id}>
            <td className="px-6 py-4 font-display text-sm font-bold text-white">{gear.name}</td>
            <td className="px-6 py-4 text-sm text-slate-300">{gear.brand}</td>
            <td className="px-6 py-4 font-display text-sm font-extrabold text-white">
              ${Number(gear.pricePerDay).toFixed(2)}
            </td>
            <td className="px-6 py-4 text-sm text-slate-300 font-semibold">
              <span className={gear.availableQuantity > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                {gear.availableQuantity}
              </span>{' '}
              / {gear.stockQuantity}
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
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Link
                  to={`/provider/gear/${gear.id}/edit`}
                  title="Edit"
                  aria-label="Edit equipment"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white"
                >
                  <Edit size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(gear.id)}
                  title="Delete"
                  aria-label="Delete equipment"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-900/50 bg-rose-950/40 text-rose-400 hover:bg-rose-900 hover:text-white"
                >
                  <Trash size={14} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
};
export default GearInventory;
