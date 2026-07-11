import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Compass, AlertTriangle } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StarRating } from '../../components/StarRating';
import { toast } from 'sonner';

export const GearDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Booking states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch Gear Details
  const { data: gearData, isLoading: loadingDetails } = useQuery({
    queryKey: ['gearDetails', id],
    queryFn: () => api.gear.getById(id!),
    enabled: !!id,
  });

  // Fetch Reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['gearReviews', id],
    queryFn: () => api.gear.getReviews(id!),
    enabled: !!id,
  });

  const gear = gearData?.data;
  const reviews = reviewsData?.data || [];

  // Duration Calculation
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  // Total Amount Calculation
  const totalAmount = useMemo(() => {
    if (!gear || durationDays <= 0) return 0;
    return Number(gear.pricePerDay) * quantity * durationDays;
  }, [gear, durationDays, quantity]);

  // Date String conversion logic matching backend datetime checks
  const formatISO = (dateStr: string, isStart: boolean) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date();
    dateObj.setFullYear(year, month - 1, day);

    const today = new Date();
    const isSameDay =
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate();

    if (isStart && isSameDay) {
      return new Date().toISOString();
    }

    dateObj.setHours(12, 0, 0, 0);
    return dateObj.toISOString();
  };

  // Place Rental Order Mutation
  const bookingMutation = useMutation({
    mutationFn: (payload: any) => api.rentals.create(payload),
    onSuccess: () => {
      toast.success('Rental order placed successfully! Awaiting provider confirmation.');
      navigate('/rentals');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to request rental order.');
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must log in to rent gear.');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only Customers can rent gear.');
      return;
    }

    if (durationDays <= 0) {
      toast.error('Rental duration must be at least 1 day.');
      return;
    }

    bookingMutation.mutate({
      startDate: formatISO(startDate, true),
      endDate: formatISO(endDate, false),
      items: [{ gearItemId: gear.id, quantity }],
    });
  };

  if (loadingDetails) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
      </div>
    );
  }

  if (!gear) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-16 text-center backdrop-blur-md">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 stroke-1" />
        <h3 className="font-display text-lg font-bold text-white mt-4">Equipment Not Found</h3>
        <p className="text-sm text-slate-400 mt-1">The requested item doesn't exist or has been removed.</p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-accentTeal px-6 py-2 font-display text-sm font-bold text-white transition-colors hover:bg-accentTealHover"
          onClick={() => navigate('/gear')}
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  const imageUrl = gear.images && gear.images[0] ? gear.images[0] : null;

  return (
    <div className="space-y-8 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="rounded-xl border border-white/5 bg-slate-900 px-4 py-2 font-display text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
      >
        ← Back
      </button>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left Hand: Product details */}
        <div className="space-y-8">
          {/* Main image card */}
          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-950">
            {imageUrl ? (
              <img src={imageUrl} alt={gear.name} className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                <Compass size={80} className="stroke-1" />
              </div>
            )}
            
            <span className={`absolute right-4 top-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border shadow-md ${
              gear.condition === 'NEW'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : gear.condition === 'GOOD'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                : 'bg-amber-950/80 text-amber-300 border-amber-800'
            }`}>
              Condition: {gear.condition}
            </span>
          </div>

          {/* Info details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-accentTeal">{gear.brand}</span>
              <h1 className="font-display text-3xl font-extrabold text-white mt-1">{gear.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 mt-2">
                <span>Category: <strong className="text-white">{gear.category?.name || 'General'}</strong></span>
                <span>•</span>
                <span className={gear.availableQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {gear.availableQuantity > 0 ? `${gear.availableQuantity} units available` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{gear.description}</p>
          </div>

          {/* Reviews Grid */}
          <div className="border-t border-white/5 pt-8 space-y-6">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews listed for this equipment yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-white">{rev.customer?.name || 'Jane Doe'}</span>
                      <StarRating rating={rev.rating} size={12} />
                    </div>
                    <p className="text-sm text-slate-400">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Booking Form panel */}
        <aside className="sticky top-24">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
            <div className="border-b border-white/5 pb-4">
              <span className="font-display text-2xl font-black text-white">${Number(gear.pricePerDay).toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-medium"> / day</span>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  required
                  className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  required
                  className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-xxs font-black uppercase tracking-wider text-slate-400 mb-2">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  required
                  min="1"
                  max={gear.availableQuantity || 1}
                  className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white focus:border-accentTeal focus:outline-none"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Number(e.target.value), gear.availableQuantity))}
                />
              </div>

              {/* Booking Calculations Breakdown */}
              {durationDays > 0 && (
                <div className="border-t border-white/5 pt-4 space-y-2 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Daily Rate</span>
                    <span className="text-white">${Number(gear.pricePerDay).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="text-white">{durationDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span className="text-white">{quantity}x</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-white/5 pt-3 font-display text-base font-bold text-white">
                    <span>Total Cost</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingMutation.isPending || gear.availableQuantity === 0}
                className="w-full rounded-xl bg-accentTeal py-3 font-display text-sm font-bold text-white hover:bg-accentTealHover disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {bookingMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Request Rental Order'
                )}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default GearDetails;
