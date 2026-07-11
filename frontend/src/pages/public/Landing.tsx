import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, ShoppingBag, DollarSign, Shield, ChevronRight } from 'lucide-react';
import { api } from '../../api';
import { GearCard } from '../../components/GearCard';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Fetch Categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  // Fetch Featured Gears
  const { data: gearsData, isLoading: loadingGears } = useQuery({
    queryKey: ['featuredGears'],
    queryFn: () => api.gear.list({ limit: 4 }),
  });

  const categories = categoriesData?.data || [];
  const featuredGears = gearsData?.data || [];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 text-center">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-500/10 to-orange-500/5 blur-[80px]" />
        
        <div className="relative z-10 mx-auto max-w-3xl px-4 space-y-6">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-none">
            Rent Sports & Outdoor Gear<br />
            <span className="bg-gradient-to-r from-accentTeal to-accentOrange bg-clip-text text-transparent">Instantly</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Premium sports and outdoor equipment rentals at a fraction of the retail cost. Buy less, explore more.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/gear')}
              className="inline-flex items-center gap-2 rounded-xl bg-accentTeal px-6 py-3 font-display text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-accentTealHover hover:-translate-y-0.5"
            >
              Browse Gear <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900 px-6 py-3 font-display text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5"
            >
              Lend Your Gear
            </button>
          </div>
        </div>
      </section>

      {/* Category List */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-black text-white">Browse By Category</h2>
            <p className="text-sm text-slate-400">Select an adventure path to view optimized gear</p>
          </div>
        </div>

        {loadingCategories ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat: any) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/gear?category=${cat.id}`)}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-accentTeal/30 hover:bg-slate-900/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-accentTeal transition-all group-hover:bg-accentTeal group-hover:text-white">
                  <Compass size={22} className="group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="mt-4 font-display text-sm font-bold text-white group-hover:text-accentTeal transition-colors">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Gear Section */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-black text-white">Featured Equipment</h2>
            <p className="text-sm text-slate-400">High quality gear, clean and ready for your trip</p>
          </div>
          <button
            onClick={() => navigate('/gear')}
            className="text-sm font-bold text-accentTeal hover:underline flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {loadingGears ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-accentTeal" />
          </div>
        ) : featuredGears.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No equipment listed yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGears.map((g: any) => (
              <GearCard key={g.id} gear={g} />
            ))}
          </div>
        )}
      </section>

      {/* Platform Features Grid */}
      <section className="mx-auto max-w-6xl px-4 bg-slate-950/40 rounded-3xl border border-white/5 p-12 backdrop-blur-sm">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-950 text-accentTeal">
              <ShoppingBag size={22} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Instant Rental Orders</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Book the gears you need for specific travel dates. Avoid buying single-use gear that occupies closet space.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-950 text-accentOrange">
              <DollarSign size={22} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Earn Money Lending</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Register as a Provider and lease out your high-quality gear. Set daily rates, manage stocks, and gain passive income.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
              <Shield size={22} />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Stripe Safeguard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              All financial transactions are handled safely via Stripe Checkout. Payment is confirmed only when the order is fulfilled.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Landing;
