import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store";
import { clearCart } from "../cart/cartSlice";
import api from "../../services/api";
import toast from "react-hot-toast";
import { CreditCard, Wallet } from "lucide-react";

export const Checkout = () => {
  const { items, startDate, endDate } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "SSLCOMMERZ">("STRIPE");

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const start = new Date(startDate!);
  const end = new Date(endDate!);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = diffDays > 0 ? diffDays : 1;

  const subtotal = items.reduce(
    (total, item) => total + item.gearItem.pricePerDay * item.quantity,
    0
  );
  
  const totalAmount = subtotal * days;

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      
      let parsedStart = new Date(startDate as string);
      let parsedEnd = new Date(endDate as string);
      
      const now = new Date();
      // If the selected date's midnight UTC is in the past, bump it to current time to pass validation
      if (parsedStart < now) {
        parsedStart = now;
      }
      
      // Ensure end date is strictly after start date
      if (parsedEnd <= parsedStart) {
        parsedEnd = new Date(parsedStart.getTime() + 24 * 60 * 60 * 1000);
      }

      const payload = {
        startDate: parsedStart.toISOString(),
        endDate: parsedEnd.toISOString(),
        items: items.map(item => ({
          gearItemId: item.gearItem.id,
          quantity: item.quantity
        }))
      };

      const response = await api.post("/rentals", payload);
      
      if (response.data.success) {
        toast.success("Rental order placed successfully!");
        dispatch(clearCart());
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-ink mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Payment details */}
        <div className="flex-1 space-y-8">
          <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200">
            <h2 className="text-xl font-bold mb-6">Payment Method</h2>
            <div className="space-y-4">
              <label 
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "STRIPE" ? "border-primary bg-primary/5" : "border-base-300 hover:bg-base-200"
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  className="radio radio-primary" 
                  checked={paymentMethod === "STRIPE"}
                  onChange={() => setPaymentMethod("STRIPE")}
                />
                <CreditCard className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-bold block">Credit/Debit Card (Stripe)</span>
                  <span className="text-sm text-gray-500">Secure online payment</span>
                </div>
              </label>

              <label 
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "SSLCOMMERZ" ? "border-primary bg-primary/5" : "border-base-300 hover:bg-base-200"
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  className="radio radio-primary" 
                  checked={paymentMethod === "SSLCOMMERZ"}
                  onChange={() => setPaymentMethod("SSLCOMMERZ")}
                />
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-bold block">SSLCommerz</span>
                  <span className="text-sm text-gray-500">Local payment methods (bKash, Nagad, Cards)</span>
                </div>
              </label>
            </div>
            
            <div className="mt-8">
              <button 
                className="btn btn-primary w-full btn-lg"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  `Pay $${totalAmount.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.gearItem.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.gearItem.name}
                  </span>
                  <span className="font-medium">
                    ${(item.gearItem.pricePerDay * item.quantity * days).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider my-4"></div>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Rental duration</span>
                <span className="font-medium">{days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <span className="font-medium text-right">
                  {start.toLocaleDateString()} - {end.toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="divider my-4"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
