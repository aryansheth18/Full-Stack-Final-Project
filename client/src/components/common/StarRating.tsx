import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  totalStars?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showNumber?: boolean;
  totalReviews?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  interactive = false,
  onRate,
  size = 'md',
  showNumber = false,
  totalReviews,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" onMouseLeave={() => interactive && setHoverRating(null)}>
        {Array.from({ length: totalStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentDisplay;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              className={`${interactive ? 'cursor-pointer transition-transform hover:scale-115 active:scale-95' : 'cursor-default'} focus:outline-none p-0.5`}
              aria-label={`${starValue} Star`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600'
                } transition-colors duration-150`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
          <span>{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
          {totalReviews !== undefined && (
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
