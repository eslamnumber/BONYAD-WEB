'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

const CARD =
  'bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm';

type Props = {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
};

/**
 * Shared shell for the customer dashboard content sections (payments, requests,
 * contracts, active projects): a card surface with an end-anchored heading and an
 * optional "view all" link pulled to the inline-start via `order-first` (while staying
 * after the heading in the DOM), plus a centered empty fallback. RTL-first like every
 * dashboard section — content anchors to the inline-end and mirrors with the locale.
 */
export function CustomerSection({
  title,
  viewAllHref,
  viewAllLabel,
  isEmpty,
  emptyText,
  children,
}: Props) {
  return (
    <section className={CARD}>
      <div className="flex w-full items-center justify-between gap-3">
        <h2 className="text-card-foreground min-w-0 text-end text-lg font-semibold">{title}</h2>
        {viewAllHref && viewAllLabel ? (
          <Link
            href={viewAllHref}
            className="text-job-accent order-first shrink-0 text-sm font-medium hover:underline"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </div>
      {isEmpty ? (
        <p className="text-card-foreground/60 w-full py-8 text-center text-sm">{emptyText}</p>
      ) : (
        children
      )}
    </section>
  );
}
