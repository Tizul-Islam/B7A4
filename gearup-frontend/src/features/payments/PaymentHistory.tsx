import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CreditCard, Eye, ArrowRight, AlertCircle, Clock, CheckCircle } from "lucide-react";
import api from "../../services/api";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  rentalId: string;
}

export const PaymentHistory = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => {
      const response = await api.get('/payments');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-24 w-full"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Error loading payments: {(error as any).message}</span>
      </div>
    );
  }

  const payments: Payment[] = data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <div className="badge badge-success gap-1"><CheckCircle className="w-3 h-3"/> Success</div>;
      case 'PENDING':
        return <div className="badge badge-warning gap-1"><Clock className="w-3 h-3"/> Pending</div>;
      case 'FAILED':
        return <div className="badge badge-error gap-1"><AlertCircle className="w-3 h-3"/> Failed</div>;
      default:
        return <div className="badge badge-ghost">{status}</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Payment History</h1>
          <p className="text-gray-500">View and manage all your billing and transactions.</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <CreditCard className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold mb-2">No payments yet</h3>
          <p className="text-gray-500 mb-6">You haven't made any payments on GearUp yet.</p>
          <Link to="/gear" className="btn btn-primary">
            Browse Gear
          </Link>
        </div>
      ) : (
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover">
                    <td className="whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="font-mono text-xs">{payment.transactionId || 'N/A'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {payment.paymentMethod === 'STRIPE' ? (
                          <div className="badge badge-outline text-primary border-primary">Stripe</div>
                        ) : payment.paymentMethod === 'SSLCOMMERZ' ? (
                          <div className="badge badge-outline text-secondary border-secondary">SSLCommerz</div>
                        ) : (
                          <div className="badge badge-outline">{payment.paymentMethod}</div>
                        )}
                      </div>
                    </td>
                    <td className="font-bold">
                      ${Number(payment.amount).toFixed(2)}
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td className="text-right">
                      <Link 
                        to={`/payments/${payment.id}`} 
                        className="btn btn-sm btn-ghost gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
