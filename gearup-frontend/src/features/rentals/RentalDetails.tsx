import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  PLACED: "badge-ghost",
  CONFIRMED: "badge-info",
  PAID: "badge-primary text-white",
  PICKED_UP: "badge-warning",
  RETURNED: "badge-success",
  CANCELLED: "badge-error",
};

export const RentalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rental", id],
    queryFn: async () => {
      const response = await api.get(`/rentals/${id}`);
      return response.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/reviews", {
        rentalOrderId: id,
        gearItemId: reviewItem.id,
        rating: reviewRating,
        comment: reviewComment
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setReviewItem(null);
      setReviewRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["gear"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/rentals/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["rental", id] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      // Invalidate gear to refresh available stock
      queryClient.invalidateQueries({ queryKey: ["gear"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/payments", { rentalOrderId: id });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="alert alert-error my-8 max-w-4xl mx-auto">
        <span>Failed to load rental details.</span>
      </div>
    );
  }

  const rental = data.data;
  const start = new Date(rental.startDate);
  const end = new Date(rental.endDate);
  const diffTime = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/rentals" className="btn btn-sm btn-ghost">← Back to Rentals</Link>
        <h1 className="text-3xl font-bold text-ink">Order Details</h1>
      </div>

      <div className="bg-base-100 p-6 rounded-lg shadow-sm border border-base-200 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="font-mono">{rental.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <div className={`badge ${statusColors[rental.status] || "badge-ghost"} badge-lg font-bold`}>
              {rental.status}
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-4">Rental Period</h3>
            <p className="text-gray-700"><strong>Start:</strong> {start.toLocaleDateString()}</p>
            <p className="text-gray-700"><strong>End:</strong> {end.toLocaleDateString()}</p>
            <p className="text-gray-700 mt-2"><strong>Duration:</strong> {days} day{days !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Details</h3>
            <p className="text-gray-700"><strong>Name:</strong> {rental.customer?.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {rental.customer?.email}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {rental.customer?.phone || "N/A"}</p>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <h3 className="font-bold text-lg mb-4">Items ({rental.items.length})</h3>
          <div className="space-y-4">
            {rental.items.map((item: any) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 last:border-0 last:pb-0 gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-base-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.gearItem.images?.[0] ? (
                      <img src={item.gearItem.images[0]} alt={item.gearItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <div>
                    <Link to={`/gear/${item.gearItem.id}`} className="font-bold hover:text-primary transition-colors">
                      {item.gearItem.name}
                    </Link>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  <div className="text-right">
                    <p className="font-semibold">${(Number(item.pricePerDay) * item.quantity * days).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">${item.pricePerDay}/day x {item.quantity}</p>
                  </div>
                  {(rental.status === "PICKED_UP" || rental.status === "RETURNED") && (
                    <button 
                      className="btn btn-sm btn-outline btn-accent"
                      onClick={() => setReviewItem(item.gearItem)}
                    >
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Total Amount</span>
          <span className="text-2xl font-bold text-primary">${Number(rental.totalAmount).toFixed(2)}</span>
        </div>

        {rental.status === "PLACED" && (
          <div className="mt-8 pt-8 border-t border-base-200">
            <button 
              className="btn btn-error btn-outline w-full sm:w-auto"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if(window.confirm("Are you sure you want to cancel this order?")) {
                  cancelMutation.mutate();
                }
              }}
            >
              {cancelMutation.isPending ? <span className="loading loading-spinner"></span> : "Cancel Order"}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Orders can only be cancelled while in PLACED status.
            </p>
          </div>
        )}

        {rental.status === "CONFIRMED" && (
          <div className="mt-8 pt-8 border-t border-base-200">
            <button 
              className="btn btn-primary btn-lg w-full sm:w-auto"
              disabled={payMutation.isPending}
              onClick={() => payMutation.mutate()}
            >
              {payMutation.isPending ? <span className="loading loading-spinner"></span> : `Pay $${Number(rental.totalAmount).toFixed(2)}`}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Pay securely via Stripe to complete your order.
            </p>
          </div>
        )}
      </div>
      
      {/* Review Modal */}
      {reviewItem && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Leave a Review</h3>
            <p className="text-sm text-gray-500 mb-4">You are reviewing <strong>{reviewItem.name}</strong></p>
            
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">Rating (1-5)</span></label>
              <div className="rating rating-lg gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <input 
                    key={star}
                    title={`Rate ${star} stars`}
                    aria-label={`Rate ${star} stars`}
                    type="radio" 
                    name="rating" 
                    className="mask mask-star-2 bg-accent" 
                    checked={reviewRating === star}
                    onChange={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            
            <div className="form-control mb-6">
              <label className="label" htmlFor="reviewComment"><span className="label-text">Comment</span></label>
              <textarea 
                id="reviewComment"
                title="Review Comment"
                className="textarea textarea-bordered h-24" 
                placeholder="How was the gear?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              ></textarea>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => {
                  setReviewItem(null);
                  setReviewRating(5);
                  setReviewComment("");
                }}
                disabled={reviewMutation.isPending}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending || !reviewComment.trim()}
              >
                {reviewMutation.isPending ? <span className="loading loading-spinner"></span> : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
