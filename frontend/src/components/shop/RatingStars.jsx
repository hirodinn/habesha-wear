import { Star } from "lucide-react";

export const ratingToFill = (rating, starIndex) => {
  const r = Number(rating) || 0;
  if (r >= starIndex) return 100;
  if (r <= starIndex - 1) return 0;
  return (r - (starIndex - 1)) * 100;
};

/** Fractional star display (e.g. 4.3 → four full + one partial). */
const RatingStars = ({ rating, size = 14, className = "" }) => {
  const r = Number(rating) || 0;
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = ratingToFill(r, s);
        return (
          <span key={s} className="relative inline-block shrink-0" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="absolute inset-0 text-[var(--border-color)] opacity-40"
              fill="currentColor"
            />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <Star size={size} className="text-[var(--color-burgundy)]" fill="currentColor" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;
