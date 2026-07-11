import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

interface GearCardProps {
  gear: {
    id: string;
    name: string;
    description: string;
    brand: string;
    images?: string[];
    pricePerDay: string | number;
    stockQuantity: number;
    availableQuantity: number;
    condition: 'NEW' | 'GOOD' | 'FAIR';
    isAvailable: boolean;
    category?: { name: string };
  };
}

export const GearCard: React.FC<GearCardProps> = ({ gear }) => {
  const imageUrl = gear.images && gear.images[0] ? gear.images[0] : null;

  return (
    <Link
      to={`/gear/${gear.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10 hover:shadow-2xl hover:shadow-cyan-950/20"
    >
      {/* Product Image */}
      <div className="relative h-48 w-full bg-slate-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={gear.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center text-slate-700 bg-slate-950">
          <Compass size={40} className="stroke-1" />
        </div>
        
        {/* Condition Badge */}
        <span className={`absolute right-3 top-3 inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wide border shadow-sm ${
          gear.condition === 'NEW'
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            : gear.condition === 'GOOD'
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
            : 'bg-amber-950/80 text-amber-300 border-amber-800'
        }`}>
          {gear.condition}
        </span>
      </div>

      {/* Body Details */}
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xxs font-black uppercase tracking-wider text-accentTeal">{gear.brand}</span>
        <h3 className="mt-1 font-display text-lg font-bold text-white group-hover:text-accentTeal transition-colors line-clamp-1">
          {gear.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {gear.description}
        </p>

        {/* Footer info */}
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="font-display">
            <span className="text-xl font-extrabold text-white">${Number(gear.pricePerDay).toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-medium"> / day</span>
          </div>
          
          <div className="text-right">
            <span className={`text-xs font-semibold ${
              gear.availableQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {gear.availableQuantity > 0 ? `${gear.availableQuantity} available` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
