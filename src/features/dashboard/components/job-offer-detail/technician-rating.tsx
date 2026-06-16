import { Star } from 'lucide-react';

/**
 * Star + numeric rating (one decimal) — the small rating chip shown on a bid card
 * and in the accept-bid modal (Figma "Frame" → star + Rating Value). The star is
 * the amber `--warning` token; the value is muted. Decorative star, so aria-hidden.
 */
export function TechnicianRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star className="text-warning fill-warning size-3.5" aria-hidden />
      <span className="text-foreground/60 text-[13px]">{rating.toFixed(1)}</span>
    </span>
  );
}
