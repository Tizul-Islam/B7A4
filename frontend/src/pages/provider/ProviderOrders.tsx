import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { toast } from 'sonner';

export const ProviderOrders: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch incoming provider orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['providerOrders'],
    queryFn: () => api.rentals.providerList(),
  });

  const orders = ordersData?.data || [];

  // Update Order Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.rentals.providerUpdateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Order status updated to ${variables.status}.`);
      queryClient.invalidateQueries({ queryKey: ['providerOrders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update order status.');
    },
  });

  const handleUpdateStatus = (id: string, status: 'CONFIRMED' | 'PICKED_UP' | 'RETURNED') => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Customer Rental Orders</h1>
        <p className="text-sm text-slate-400">Review incoming reservation requests and manage handovers/returns</p>
      </div>

      <DataTable
        headers={['Customer Info', 'Equipment Item', 'Rental Duration', 'Order Cost', 'Status', 'Fulfillment Actions']}
        data={orders}
        loading={isLoading}
        emptyMessage="No customer booking requests recorded yet."
        renderRow={(order: any) => {
          const item = order.items?.[0];
          const gear = item?.gearItem;
          const isPendingUpdate = updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id;

          return (
            <tr key={order.id}>
              {/* Customer Column */}
              <td className="px-6 py-4">
                <div>
                  <strong className="font-display text-sm font-bold text-white block">{order.customer?.name}</strong>
                  <span className="text-xs text-slate-400 font-mono block">{order.customer?.email}</span>
                </div>
              </td>

              {/* Gear Column */}
              <td className="px-6 py-4 text-sm text-slate-300">
                <div>
                  <strong className="text-white">{gear?.name || 'Equipment'}</strong>
                  <span className="text-xs text-slate-500 block">Quantity: {item?.quantity || 1}x</span>
                </div>
              </td>

              {/* Dates Column */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar size={14} className="text-accentTeal" />
                  <span>
                    {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                  </span>
                </div>
              </td>

              {/* Cost Column */}
              <td className="px-6 py-4 font-display text-sm font-extrabold text-white">
                ${Number(order.totalAmount).toFixed(2)}
              </td>

              {/* Status Column */}
              <td className="px-6 py-4">
                <OrderStatusBadge status={order.status} />
              </td>

              {/* Actions Column */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {isPendingUpdate ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-accentTeal" />
                  ) : (
                    <>
                      {order.status === 'PLACED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                          className="rounded-lg bg-accentTeal hover:bg-accentTealHover text-white px-3 py-1.5 font-display text-xs font-bold transition-all shadow-sm"
                        >
                          Confirm Order
                        </button>
                      )}

                      {order.status === 'PAID' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PICKED_UP')}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 font-display text-xs font-bold transition-all shadow-sm"
                        >
                          Mark Picked Up
                        </button>
                      )}

                      {order.status === 'PICKED_UP' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'RETURNED')}
                          className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 font-display text-xs font-bold transition-all shadow-sm"
                        >
                          Confirm Return
                        </button>
                      )}

                      {!['PLACED', 'PAID', 'PICKED_UP'].includes(order.status) && (
                        <span className="text-xs text-slate-500 font-semibold">Locked</span>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
};
export default ProviderOrders;
