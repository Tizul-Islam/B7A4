import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ShoppingBag } from 'lucide-react';
import { api } from '../../api';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { toast } from 'sonner';

export const RentalsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Customer Rental Orders
  const { data: rentalsData, isLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: () => api.rentals.list(),
  });

  const rentals = rentalsData?.data || [];

  // Cancel Rental Order Mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.rentals.cancel(id),
    onSuccess: () => {
      toast.success('Order cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel order.');
    },
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelMutation.mutate(id);
    }
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
        <h1 className="font-display text-3xl font-extrabold text-white">My Rental Bookings</h1>
        <p className="text-sm text-slate-400">Track and manage your outdoor equipment reservations</p>
      </div>

      {rentals.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-16 text-center backdrop-blur-md">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-600 stroke-1" />
          <h3 className="font-display text-lg font-bold text-white mt-4">No Rentals Yet</h3>
          <p className="text-sm text-slate-400 mt-1">You haven't requested any outdoor gear rentals.</p>
          <button
            onClick={() => navigate('/gear')}
            className="mt-6 rounded-xl bg-accentTeal px-6 py-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-accentTealHover"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {rentals.map((order: any) => {
            const item = order.items?.[0];
            const gear = item?.gearItem;
            
            return (
              <div
                key={order.id}
                className="group rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md transition-colors hover:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-white">{gear?.name || 'Equipment'}</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-accentTeal" />
                      {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                    </span>
                    <span>Brand: <strong className="text-white">{gear?.brand || 'N/A'}</strong></span>
                    <span>Quantity: <strong className="text-white">{item?.quantity || 1}x</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right font-display">
                    <span className="text-xs text-slate-500 font-medium block">Total Price</span>
                    <span className="text-xl font-extrabold text-white">${Number(order.totalAmount).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/rentals/${order.id}`}
                      className="rounded-xl border border-white/5 bg-slate-950 px-4 py-2 font-display text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
                    >
                      Details
                    </Link>

                    {order.status === 'PLACED' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.id)}
                        className="rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 px-4 py-2 font-display text-sm font-bold hover:bg-rose-900 hover:text-white"
                      >
                        Cancel
                      </button>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <Link
                        to={`/rentals/${order.id}/pay`}
                        className="rounded-xl bg-accentTeal text-white px-4 py-2 font-display text-sm font-bold hover:bg-accentTealHover shadow-lg shadow-sky-500/20"
                      >
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default RentalsList;
