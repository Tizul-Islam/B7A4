import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { api } from '../../api';
import { toast } from 'sonner';

// Initialize Stripe outside of component
const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51Tp8EVHgkor71BPa0vYc17iR5h2r30yR2d15XhF5f6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5'; // test dummy key fallback
const stripePromise = loadStripe(stripePublishableKey);

const CheckoutForm: React.FC<{ rentalOrderId: string }> = ({ rentalOrderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    try {
      const returnUrl = `${window.location.origin}/rentals/${rentalOrderId}`;
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment confirmation failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
        <PaymentElement />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-xl bg-accentTeal py-3 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center"
      >
        {submitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          'Confirm Stripe Payment'
        )}
      </button>
    </form>
  );
};

export const StripePay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);

  // Fetch Order
  const { data: orderData } = useQuery({
    queryKey: ['rentalDetails', id],
    queryFn: () => api.rentals.getById(id!),
    enabled: !!id,
  });

  const order = orderData?.data;

  // Initialize Payment Session
  useEffect(() => {
    const initPayment = async () => {
      if (!id) return;
      try {
        const res = await api.payments.create(id);
        // Stripe integration returns either clientSecret or payment details
        // In our custom backend, it returns checkoutUrl and transactionId/payment session.
        // If it returns checkoutUrl (Stripe Checkout Session), we can directly redirect there!
        if (res.data?.checkoutUrl) {
          toast.success('Redirecting to Stripe Checkout...');
          window.location.href = res.data.checkoutUrl;
          return;
        }

        // If it's standard Elements secret
        if (res.data?.clientSecret) {
          setClientSecret(res.data.clientSecret);
        } else if (res.data?.payment?.transactionId) {
          setStripeSessionId(res.data.payment.transactionId);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to create payment session.');
      } finally {
        setLoadingSecret(false);
      }
    };

    initPayment();
  }, [id]);

  // Fallback / Mock Payment completion for developer testing when checkout session is loaded
  const handleMockPayComplete = async () => {
    if (!stripeSessionId) return;
    try {
      setLoadingSecret(true);
      await api.payments.verify(stripeSessionId);
      toast.success('Mock Payment Complete!');
      navigate(`/rentals/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Mock payment verification failed.');
    } finally {
      setLoadingSecret(false);
    }
  };

  if (loadingSecret) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-16">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2 font-display text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          ← Back
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-white">Stripe Payment Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">Complete your reservation purchase securely</p>
        </div>

        {order && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Rental Order ID</span>
              <span className="font-bold text-white">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Price</span>
              <span className="font-bold text-emerald-400">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* If Stripe Checkout redirects directly, we don't render PaymentElement. Otherwise, if clientSecret exists, mount Elements */}
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm rentalOrderId={id!} />
          </Elements>
        ) : stripeSessionId ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-400">
              A Stripe Checkout Session was generated for this order. 
            </p>
            <button
              onClick={() => {
                // Try redirecting again
                api.payments.create(id!).then(res => {
                  if (res.data?.checkoutUrl) window.location.href = res.data.checkoutUrl;
                });
              }}
              className="w-full rounded-xl bg-accentTeal py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover"
            >
              Redirect to Stripe Checkout
            </button>
            <div className="border-t border-white/5 pt-4 text-xs text-slate-500">Or simulate verification locally:</div>
            <button
              onClick={handleMockPayComplete}
              className="w-full rounded-xl border border-white/5 bg-slate-950 py-2 font-display text-sm font-bold text-white hover:bg-slate-900"
            >
              Simulate Dev Payment Success
            </button>
          </div>
        ) : (
          <div className="text-center p-6 text-slate-400 text-sm">
            Could not initialize payment Elements. Please verify Stripe API keys are configured.
          </div>
        )}
      </div>
    </div>
  );
};
export default StripePay;
