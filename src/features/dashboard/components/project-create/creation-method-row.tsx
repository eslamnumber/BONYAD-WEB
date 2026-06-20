import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';

import { ChevronLeftIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type Variant = 'ai' | 'manual';

/** Per-variant accents — AI is the highlighted/recommended purple (reuses the
 *  `status-bid` "best value" token); manual is the brand navy. */
const VARIANT: Record<
  Variant,
  { border: string; title: string; subtitle: string; accent: string }
> = {
  ai: {
    border: 'border-status-bid',
    title: 'text-status-bid',
    subtitle: 'text-status-bid/60',
    accent: 'text-status-bid',
  },
  manual: {
    border: 'border-brand-dark-navy',
    title: 'text-foreground',
    subtitle: 'text-foreground/60',
    accent: 'text-foreground',
  },
};

export type CreationMethodRowProps = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  variant: Variant;
  /** When set the row is an active link; otherwise it renders inert. */
  href?: string;
  /** Optional pill straddling the top edge (the AI row's "Beta" marker). */
  badge?: string;
};

const ROW =
  'relative flex w-full items-center justify-between gap-4 rounded-2xl border bg-dashboard-search-bg p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] backdrop-blur-[8px]';

/**
 * One creation-method option on the "Create a project" picker (Figma 1579:2551 rows):
 * a leading forward/disclosure chevron, a title + subtitle anchored to the inline end,
 * and an accent icon. The active (manual) row is a `Link` to the wizard; the inert
 * (AI, not built yet) row renders as a div and keeps its Beta badge.
 */
export function CreationMethodRow({
  Icon,
  title,
  subtitle,
  variant,
  href,
  badge,
}: CreationMethodRowProps) {
  const v = VARIANT[variant];
  const body = (
    <>
      <ChevronLeftIcon className={cn('size-6 shrink-0 rtl:-scale-x-100', v.accent)} aria-hidden />
      <span className="flex min-w-0 flex-1 items-center justify-end gap-4">
        <span className="flex min-w-0 flex-col items-end gap-2 text-end">
          <span className={cn('text-xl font-medium', v.title)}>{title}</span>
          <span className={cn('text-xs leading-normal', v.subtitle)}>{subtitle}</span>
        </span>
        <Icon className={cn('size-9 shrink-0', v.accent)} aria-hidden />
      </span>
      {badge ? (
        <span className="border-status-bid bg-status-bid-tint text-status-bid absolute end-4 -top-3 rounded-full border px-4 py-1 text-xs font-medium">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={cn(ROW, v.border, 'cursor-not-allowed')}>{body}</div>;
  }
  return (
    <Link
      href={href}
      className={cn(
        ROW,
        v.border,
        'focus-visible:outline-ring transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:shadow-[0px_6px_28px_0px_rgba(0,0,0,0.14)]',
      )}
    >
      {body}
    </Link>
  );
}
