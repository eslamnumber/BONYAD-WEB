import { type ReactNode } from 'react';

/**
 * Shared card chrome for the in-progress detail's left-column cards (Figma
 * 1103:6632 summary + 1103:6649 payments): white surface, hairline border, soft
 * elevation, a medium-weight heading and a full-width divider, then the rows.
 * `shadow-sm` approximates the Figma's near-invisible `0 4px 10px rgba(0,0,0,0.03)`
 * drop shadow without a hardcoded colour literal.
 */
export function DetailCard({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-lg border p-6 shadow-sm">
      <div className="flex w-full flex-col items-end gap-3">
        <h2 className="text-foreground text-end text-lg font-medium">{heading}</h2>
        <hr className="border-border w-full border-t" />
      </div>
      <div className="flex w-full flex-col gap-4">{children}</div>
    </section>
  );
}
