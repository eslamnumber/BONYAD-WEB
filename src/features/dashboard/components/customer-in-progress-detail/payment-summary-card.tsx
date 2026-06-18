'use client';

import { type ReactNode } from 'react';

/**
 * The blue-grey "operation summary" card used twice in the review + success steps
 * (Figma node "card-ملخص المشروع" 1553:8107 / 1553:8125 / 1553:8487): a heading +
 * divider over a stack of label/value rows. Surface from `--color-payment-summary`.
 */
export function PaymentSummaryCard({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-payment-summary border-border flex w-full flex-col gap-5 rounded-lg border p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex w-full flex-col items-end gap-3">
        <h3 className="text-foreground text-end text-lg font-medium">{heading}</h3>
        <div className="bg-border h-px w-full" />
      </div>
      <div className="flex w-full flex-col gap-4 text-sm">{children}</div>
    </div>
  );
}

/** One label/value row: the value (foreground, bidi-isolated) at the inline-start,
 *  the label (muted) at the inline-end — matching the RTL-first summary layout. */
export function SummaryRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      <span className="text-foreground font-medium">
        <bdi>{children}</bdi>
      </span>
      <span className="text-muted-foreground text-end">{label}</span>
    </div>
  );
}
