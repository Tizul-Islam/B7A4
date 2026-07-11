import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 16,
}) => {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''
          } ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-600'}`}
          onClick={() => {
            if (interactive && onChange) {
              onChange(star);
            }
          }}
        />
      ))}
    </div>
  );
};
