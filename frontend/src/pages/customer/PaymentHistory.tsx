import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { DataTable } from '../../components/DataTable';


export const PaymentHistory: React.FC = () => {
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['paymentsHistory'],
    queryFn: () => api.payments.list(),
  });

  const payments = paymentsData?.data || [];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Payment Transactions</h1>
        <p className="text-sm text-slate-400">View history of card payments made via Stripe Checkout</p>
      </div>

      <DataTable
        headers={['Transaction ID', 'Rental Order', 'Paid Amount', 'Gateway', 'Payment Status', 'Date Paid']}
        data={payments}
        loading={isLoading}
        emptyMessage="No billing transactions recorded yet."
        renderRow={(pay: any) => (
          <tr key={pay.id}>
            <td className="px-6 py-4 font-body text-xs text-slate-400 font-bold">{pay.transactionId}</td>
            <td className="px-6 py-4 text-sm text-slate-300">
              <span className="block text-xs font-mono">{pay.rentalOrderId}</span>
            </td>
            <td className="px-6 py-4 font-display text-sm font-extrabold text-white">
              ${Number(pay.amount).toFixed(2)}
            </td>
            <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {pay.method}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold border uppercase tracking-wider ${
                pay.status === 'COMPLETED'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                  : pay.status === 'PENDING'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                  : 'bg-rose-950/40 text-rose-300 border-rose-800'
              }`}>
                {pay.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-400">
              {pay.paidAt ? new Date(pay.paidAt).toLocaleString() : 'Pending verification'}
            </td>
          </tr>
        )}
      />
    </div>
  );
};
export default PaymentHistory;
