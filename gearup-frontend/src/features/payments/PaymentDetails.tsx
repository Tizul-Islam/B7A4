import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Download, Package } from "lucide-react";
import api from "../../services/api";

export const PaymentDetails = () => {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const response = await api.get(`/payments/${id}`);
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <div className="skeleton h-12 w-48"></div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link to="/payments" className="btn btn-ghost btn-sm mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>
        <div className="alert alert-error">
          <span>Error loading payment details: {(error as any)?.message || 'Payment not found'}</span>
        </div>
      </div>
    );
  }

  const payment = data;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/payments" className="btn btn-ghost btn-sm mb-6 gap-2 px-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Payment History
      </Link>

      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-base-200/50 p-8 text-center border-b border-base-200">
          <div className="flex justify-center mb-4">
            {payment.status === 'SUCCESS' ? (
              <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
            ) : payment.status === 'PENDING' ? (
              <div className="w-16 h-16 rounded-full bg-warning/20 text-warning flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-error/20 text-error flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">Payment {payment.status}</h1>
          <p className="text-gray-500 text-sm font-mono">Receipt #{payment.id.split('-')[0].toUpperCase()}</p>
          <div className="text-4xl font-bold mt-4">${Number(payment.amount).toFixed(2)}</div>
        </div>

        {/* Receipt Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Transaction Details</h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-gray-500 block text-sm">Date</span>
                  <span className="font-semibold">
                    {new Date(payment.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </li>
                <li>
                  <span className="text-gray-500 block text-sm">Payment Method</span>
                  <span className="font-semibold">{payment.paymentMethod}</span>
                </li>
                <li>
                  <span className="text-gray-500 block text-sm">Transaction ID</span>
                  <span className="font-mono text-sm break-all">{payment.transactionId || 'N/A'}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Information</h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-gray-500 block text-sm">Rental Order ID</span>
                  <span className="font-mono text-sm break-all">{payment.rentalId}</span>
                </li>
                <li>
                  <span className="text-gray-500 block text-sm">Customer Email</span>
                  <span className="font-semibold">{payment.customer?.email || 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-base-200 pt-6 mt-6 flex flex-wrap gap-4 justify-between items-center">
            <Link to={`/rentals/${payment.rentalId}`} className="btn btn-primary gap-2">
              <Package className="w-4 h-4" />
              View Rental Order
            </Link>
            <button className="btn btn-outline gap-2" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
