import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-100 p-8 rounded-xl shadow-lg border border-base-200 text-center">
        <div className="flex flex-col items-center">
          <AlertCircle className="w-16 h-16 text-warning mb-6" />
          <h2 className="text-2xl font-bold text-ink mb-2">Payment Cancelled</h2>
          <p className="text-gray-500 mb-8">
            You have cancelled the checkout process. Your order is still reserved, but it will not be processed until payment is completed.
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary w-full mb-3">
            Go Back
          </button>
          <Link to="/rentals" className="btn btn-ghost w-full">
            View My Rentals
          </Link>
        </div>
      </div>
    </div>
  );
};
