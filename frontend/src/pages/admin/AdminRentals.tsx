import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';

export const AdminRentals: React.FC = () => {
  // Fetch All Platform Rental Bookings
  const { data: rentalsData, isLoading } = useQuery({
    queryKey: ['adminRentals'],
    queryFn: () => api.admin.rentals(),
  });

  const rentals = rentalsData?.data || [];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Platform Bookings</h1>
        <p className="text-sm text-slate-400">Read-only auditing view of all customer rentals</p>
      </div>

      <DataTable
        headers={['Order ID', 'Customer Info', 'Start Date', 'End Date', 'Total Amount', 'Fulfillment Status']}
        data={rentals}
        loading={isLoading}
        emptyMessage="No rental bookings recorded on the platform yet."
        renderRow={(order: any) => (
          <tr key={order.id}>
            <td className="px-6 py-4 text-xs font-mono text-slate-400 font-bold">{order.id}</td>
            <td className="px-6 py-4 text-sm text-slate-300">
              <div>
                <strong className="text-white block">{order.customer?.name}</strong>
                <span className="text-xs text-slate-500 font-mono block">{order.customer?.email}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-400">
              {new Date(order.startDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-sm text-slate-400">
              {new Date(order.endDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 font-display text-sm font-extrabold text-white">
              ${Number(order.totalAmount).toFixed(2)}
            </td>
            <td className="px-6 py-4">
              <OrderStatusBadge status={order.status} />
            </td>
          </tr>
        )}
      />
    </div>
  );
};
export default AdminRentals;
