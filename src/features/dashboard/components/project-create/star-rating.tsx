import { StarIcon } from '@/components/icons';

const STARS = [0, 1, 2, 3, 4];

/**
 * Five-star strip + one-decimal value — the rating shown on a technician-picker
 * row (Figma 1394:7831). Filled stars use the amber `--warning` token; the value
 * is hidden when the backend sent no rating. Decorative, so aria-hidden.
 */
export function StarRating({ rating }: { rating?: number | null }) {
  const value = typeof rating === 'number' ? rating : 0;
  const filled = Math.round(value);
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      <span className="flex items-center gap-0.5">
        {STARS.map((i) => (
          <StarIcon
            key={i}
            className={`size-3.5 ${i < filled ? 'text-warning' : 'text-foreground/20'}`}
          />
        ))}
      </span>
      {typeof rating === 'number' ? (
        <span className="text-foreground/60 text-[13px]">{value.toFixed(1)}</span>
      ) : null}
    </span>
  );
}
