import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Invalid payment session.");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        const response = await api.post("/payments/verify", { sessionId });
        if (response.data.success) {
          setStatus("success");
          setMessage("Payment successful! Your order is now PAID.");
        } else {
          setStatus("error");
          setMessage("Payment verification failed.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "An error occurred during verification.");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-100 p-8 rounded-xl shadow-lg border border-base-200 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-ink mb-2">Processing Payment</h2>
            <p className="text-gray-500">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-success mb-6" />
            <h2 className="text-2xl font-bold text-ink mb-2">Thank You!</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <Link to="/rentals" className="btn btn-primary w-full">
              View My Rentals
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-error mb-6" />
            <h2 className="text-2xl font-bold text-ink mb-2">Payment Failed</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary btn-outline w-full mb-3">
              Go Back
            </button>
            <Link to="/rentals" className="btn btn-ghost w-full">
              View My Rentals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
