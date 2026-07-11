import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-8 backdrop-blur-md text-center space-y-6">
        <div className="status-icon-glow cancel">
          <XCircle size={36} />
        </div>
        
        <div>
          <h2 className="font-display text-2xl font-black text-white">Payment Cancelled</h2>
          <p className="text-xs text-slate-400 mt-1">
            The Stripe checkout process was aborted. No charge was made to your account.
          </p>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-sm text-slate-300">
          Your equipment reservation order remains in <strong className="text-blue-400">CONFIRMED</strong> status. 
          You can attempt the payment again at any time before the rental start date.
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/rentals"
            className="rounded-xl bg-accentTeal py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/10"
          >
            <ArrowLeft size={14} /> Back to My Rentals
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/5 bg-slate-950 py-2.5 font-display text-xs font-bold text-slate-400 hover:text-white transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
