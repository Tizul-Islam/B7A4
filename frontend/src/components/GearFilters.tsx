import React from 'react';
import { Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface GearFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  condition: string;
  setCondition: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  categories: Category[];
  resetFilters: () => void;
}

export const GearFilters: React.FC<GearFiltersProps> = ({
  search,
  setSearch,
  categoryId,
  setCategoryId,
  condition,
  setCondition,
  maxPrice,
  setMaxPrice,
  categories,
  resetFilters,
}) => {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md">
      {/* Search Input */}
      <div>
        <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Search</h4>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full rounded-xl border border-white/5 bg-slate-950/60 py-2.5 pl-11 pr-4 font-body text-sm text-white placeholder-slate-500 transition-colors focus:border-accentTeal focus:outline-none"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Category</h4>
        <select
          className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white transition-colors focus:border-accentTeal focus:outline-none"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Dropdown */}
      <div>
        <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Condition</h4>
        <select
          className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 font-body text-sm text-white transition-colors focus:border-accentTeal focus:outline-none"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">Any Condition</option>
          <option value="NEW">New (Unused)</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair (Shows use)</option>
        </select>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-400">Max Price / Day</h4>
          <span className="text-sm font-extrabold text-white">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="5"
          max="500"
          step="5"
          className="w-full cursor-pointer accent-accentTeal"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <div className="mt-1 flex justify-between text-xxs font-bold text-slate-600">
          <span>$5</span>
          <span>$500</span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        className="w-full rounded-xl border border-white/5 bg-slate-950 py-2.5 font-display text-sm font-bold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
        onClick={resetFilters}
      >
        Clear Filters
      </button>
    </div>
  );
};
