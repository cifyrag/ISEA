import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | undefined;
  onChange?: (rating: number | undefined) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
};

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }: StarRatingProps) {
  const starSize = sizeClasses[size];

  return (
    <div className="flex gap-0.5" role={readOnly ? 'img' : undefined} aria-label={readOnly && value ? `${value} out of 5 stars` : undefined}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== undefined && star <= value;
        const partialFill = value !== undefined && !filled && star - value < 1 && star - value > 0;

        if (readOnly) {
          return (
            <span key={star} className="inline-flex">
              <Star
                className={`${starSize} ${
                  filled
                    ? 'text-yellow-400 fill-yellow-400'
                    : partialFill
                      ? 'text-yellow-400 fill-yellow-200'
                      : 'text-abyss-300'
                }`}
              />
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(value === star ? undefined : star)}
            aria-label={`${star} out of 5 stars`}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`${starSize} ${
                filled
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-abyss-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
