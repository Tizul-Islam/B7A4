import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../api';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [verifying, setVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  // Track polling attempts
  const [pollCount, setPollCount] = useState(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const verifyPayment = async (sid: string) => {
    try {
      const res = await api.payments.verify(sid);
      const paymentData = res.data;
      setPaymentDetails(paymentData);
      
      const orderStatus = paymentData?.rentalOrder?.status;

      // If the order status has been updated to PAID, we are done
      if (orderStatus === 'PAID') {
        setVerifying(false);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      } else {
        // If not yet PAID (webhook delay), start or continue polling
        setPollCount((prev) => prev + 1);
      }
    } catch (err: any) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setErrorMsg(err.message || 'Payment verification failed on the server.');
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setErrorMsg('Missing Stripe session identifier in parameters.');
      setVerifying(false);
      return;
    }

    // Initial check
    verifyPayment(sessionId);

    // Setup polling every 2.5 seconds to wait for webhook delivery
    pollTimerRef.current = setInterval(() => {
      verifyPayment(sessionId);
    }, 2500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [sessionId]);

  // Handle timeout/max poll limit (e.g., 8 attempts = 20 seconds)
  useEffect(() => {
    if (pollCount >= 8) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setVerifying(false);
      // Even if polling stops, we can show details we have
    }
  }, [pollCount]);

  if (verifying) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-8 backdrop-blur-md space-y-6 flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-accentTeal animate-spin stroke-1" />
          <h2 className="font-display text-xl font-bold text-white">Verifying Transaction</h2>
          <p className="text-sm text-slate-400">
            Awaiting final confirmation from Stripe payment gateway. This may take a moment...
          </p>
          {pollCount > 1 && (
            <span className="text-xxs font-semibold text-slate-500 font-mono">
              Status update attempt: {pollCount}/8
            </span>
          )}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-8 backdrop-blur-md space-y-6">
          <div className="status-icon-glow cancel">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-white">Verification Failed</h2>
          <p className="text-sm text-rose-300">{errorMsg}</p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/rentals"
              className="rounded-xl bg-accentTeal py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover transition-all flex items-center justify-center gap-1"
            >
              Go to My Rentals <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = paymentDetails?.rentalOrder;
  const isPaid = order?.status === 'PAID';

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-8 backdrop-blur-md text-center space-y-6">
        <div className={`status-icon-glow ${isPaid ? 'success' : 'cancel'}`}>
          {isPaid ? <ShieldCheck size={36} /> : <AlertTriangle size={36} />}
        </div>
        
        <div>
          <h2 className="font-display text-2xl font-black text-white">
            {isPaid ? 'Payment Confirmed!' : 'Awaiting Settlement'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isPaid 
              ? 'Your booking is paid and secured. Show this receipt when picking up.' 
              : 'Stripe processed the transaction but order status updates are pending.'}
          </p>
        </div>

        {/* Receipt specs */}
        {paymentDetails && (
          <div className="bg-slate-950/40 p-5 rounded-xl border border-white/5 text-left text-xs space-y-3 font-body">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Transaction ID</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]" title={paymentDetails.transactionId}>
                {paymentDetails.transactionId}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Rental Order ID</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]" title={order?.id}>
                {order?.id || paymentDetails.rentalOrderId}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Payment Gateway</span>
              <span className="font-bold text-slate-300 uppercase">{paymentDetails.method}</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Amount Captured</span>
              <span className="font-bold text-emerald-400 font-display text-sm">
                ${Number(paymentDetails.amount).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Order Status</span>
              <span className={`font-bold uppercase ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order?.status || 'PAID'}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          {order?.id && (
            <Link
              to={`/rentals/${order.id}`}
              className="rounded-xl bg-accentTeal py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
            >
              View Order Details <ArrowRight size={14} />
            </Link>
          )}
          <Link
            to="/rentals"
            className="rounded-xl border border-white/5 bg-slate-950 py-2.5 font-display text-xs font-bold text-slate-400 hover:text-white transition-all"
          >
            Back to Booking List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
