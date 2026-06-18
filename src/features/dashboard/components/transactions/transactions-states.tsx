'use client';

import { type ReactNode } from 'react';

import { Button, Skeleton } from '@/components/ui';

/** Three card-shaped shimmer rows while the first page loads. */
export function TransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[132px] w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Centred glyph + headline + sub-copy, shared by the empty and error states. */
export function TransactionsPlaceholder({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        {icon}
      </span>
      <p className="text-foreground text-base font-medium">{title}</p>
      <p dir="auto" className="text-muted-foreground max-w-xs text-sm">
        {subtitle}
      </p>
      {action}
    </div>
  );
}

/** Centred "Load more" button for the infinite lists. */
export function LoadMoreButton({
  loading,
  onClick,
  label,
}: {
  loading: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="flex justify-center pt-1">
      <Button type="button" variant="outline" onClick={onClick} disabled={loading}>
        {label}
      </Button>
    </div>
  );
}
