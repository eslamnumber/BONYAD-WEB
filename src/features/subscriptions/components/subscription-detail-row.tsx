import type { ReactNode } from 'react';

/**
 * A single label / value cell inside a subscription card. Label is a static UI
 * string (no `dir="auto"`, per the inverted-mapping bidi rule); the value may be a
 * node (date string, number, or a status pill). Aligned to the inline start so a
 * grid of cells reads as a clean two-column key/value table in both directions.
 */
export function SubscriptionDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 text-start">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-sm font-medium">{value}</span>
    </div>
  );
}
