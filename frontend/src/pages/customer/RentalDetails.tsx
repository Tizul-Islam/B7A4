import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ShoppingBag, CreditCard, ChevronRight, MessageSquare } from 'lucide-react';
import { api } from '../../api';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { StarRating } from '../../components/StarRating';
import { toast } from 'sonner';

export const RentalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewGearId, setReviewGearId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Fetch Order Details
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['rentalDetails', id],
    queryFn: () => api.rentals.getById(id!),
    enabled: !!id,
  });

  const order = orderData?.data;
  const item = order?.items?.[0];
  const gear = item?.gearItem;

  // Stepper timeline configurations
  const steps = ['PLACED', 'CONFIRMED', 'PAID', 'PICKED_UP', 'RETURNED'];
  const getStepIndex = (status: string) => steps.indexOf(status);

  // Cancel order Mutation
  const cancelMutation = useMutation({
    mutationFn: () => api.rentals.cancel(id!),
    onSuccess: () => {
      toast.success('Rental order cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['rentalDetails', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel order.');
    },
  });

  // Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: (payload: any) => api.reviews.create(payload),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['rentalDetails', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit review.');
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      rentalOrderId: id,
      gearItemId: reviewGearId,
      rating,
      comment,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-16 text-center backdrop-blur-md">
        <h3 className="font-display text-lg font-bold text-white">Rental Order Not Found</h3>
        <button onClick={() => navigate('/rentals')} className="mt-6 rounded-xl bg-accentTeal px-6 py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover">
          Back to My Rentals
        </button>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Rental Order Details</h1>
          <span className="text-xs text-slate-400">Order ID: {order.id}</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Progress Timeline Stepper */}
      {order.status !== 'CANCELLED' && (
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Connecting lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-accentTeal -translate-y-1/2 hidden md:block z-0 transition-all duration-500"
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold border transition-all duration-300 ${
                      isCurrent
                        ? 'bg-accentTeal border-sky-400 text-white ring-4 ring-sky-500/20'
                        : isActive
                        ? 'bg-slate-900 border-accentTeal text-accentTeal'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`font-display text-xxs font-extrabold tracking-wider transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Box */}
      <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
            <h2 className="font-display text-lg font-bold text-white mb-4">Equipment Summary</h2>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 text-slate-600 border border-white/5">
                <ShoppingBag size={24} />
              </div>
              <div className="flex-1 space-y-1">
                <Link to={`/gear/${gear?.id}`} className="font-display text-base font-bold text-white hover:text-accentTeal transition-colors">
                  {gear?.name || 'Equipment'}
                </Link>
                <div className="text-xs text-slate-400">Brand: {gear?.brand || 'N/A'}</div>
                <div className="text-xs text-slate-400">Condition: {gear?.condition}</div>
              </div>
              <div className="text-right font-display">
                <span className="text-sm font-bold text-white">${Number(item?.pricePerDay).toFixed(2)}</span>
                <span className="text-xs text-slate-400 block">Qty: {item?.quantity || 1}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
            <h2 className="font-display text-lg font-bold text-white mb-4">Rental Duration</h2>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-accentTeal" />
                <span>
                  <strong>Start:</strong> {new Date(order.startDate).toLocaleDateString()}
                </span>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-accentTeal" />
                <span>
                  <strong>End:</strong> {new Date(order.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost summary column */}
        <aside className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
          <h2 className="font-display text-lg font-bold text-white">Cost & Actions</h2>
          
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between font-display text-base font-bold text-white border-b border-white/5 pb-3 mb-4">
              <span>Total Price</span>
              <span>${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* User actions */}
          <div className="space-y-3">
            {order.status === 'PLACED' && (
              <button
                type="button"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="w-full rounded-xl bg-rose-950/60 border border-rose-800 py-2.5 font-display text-sm font-bold text-rose-300 hover:bg-rose-900 hover:text-white disabled:opacity-40 transition-all flex items-center justify-center"
              >
                {cancelMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
                ) : (
                  'Cancel Rental Order'
                )}
              </button>
            )}

            {order.status === 'CONFIRMED' && (
              <Link
                to={`/rentals/${order.id}/pay`}
                className="w-full rounded-xl bg-accentTeal py-2.5 font-display text-sm font-bold text-white hover:bg-accentTealHover transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                <CreditCard size={16} /> Pay Now (Stripe)
              </Link>
            )}

            {order.status === 'RETURNED' && (
              <button
                type="button"
                onClick={() => {
                  setReviewGearId(gear?.id || '');
                  setShowReviewModal(true);
                }}
                className="w-full rounded-xl bg-slate-950 border border-white/5 py-2.5 font-display text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Write Review
              </button>
            )}

            {!['PLACED', 'CONFIRMED', 'RETURNED'].includes(order.status) && (
              <div className="text-center py-2 text-xs font-semibold text-slate-500">
                Awaiting next provider step.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODAL: SUBMIT REVIEW */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/5 bg-slate-900 p-6 shadow-2xl relative">
            <h3 className="font-display text-lg font-bold text-white mb-4">Write Review</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Rating</label>
                <StarRating rating={rating} interactive onChange={(r) => setRating(r)} size={22} />
              </div>

              <div>
                <label className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Comment</label>
                <textarea
                  className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                  rows={4}
                  required
                  placeholder="Share your experience with this equipment. Was it clean? Did it perform well?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-xl border border-white/5 bg-slate-950 px-4 py-2 font-display text-sm font-bold text-slate-300 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="rounded-xl bg-accentTeal px-4 py-2 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center"
                >
                  {reviewMutation.isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default RentalDetails;
