import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';

import { cn } from '@/lib/utils';

export type CreationOptionCardProps = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  /** Accent token utility for the icon stroke, e.g. `text-create-option-amber`. */
  accentText: string;
  /** Matching accent token utility for the corner glow, e.g. `bg-create-option-amber`. */
  glowBg: string;
  /** When set, the card is an active link; otherwise it renders inert with a badge. */
  href?: string;
  /** "Coming soon" label shown on inert (not-yet-built) options. */
  comingSoonLabel?: string;
};

const CARD =
  'group relative flex min-h-[214px] flex-col items-end justify-between overflow-hidden rounded-2xl border border-border bg-dashboard-search-bg p-4 text-end shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] backdrop-blur-[8px]';

/**
 * One creation-method option on the create-project chooser (Figma 1574:2384 cards).
 * A glass card with a blurred accent-coloured corner glow (the Figma "Ellipse 66"
 * blob, reproduced from the accent token so it themes in dark mode and mirrors via
 * the logical `start` edge), an accent line icon, and a title + subtitle anchored to
 * the inline end. Active options are a `Link`; not-yet-built ones render inert.
 */
export function CreationOptionCard({
  Icon,
  title,
  subtitle,
  accentText,
  glowBg,
  href,
  comingSoonLabel,
}: CreationOptionCardProps) {
  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute start-[-82px] top-[-70px] size-[164px] rounded-full opacity-50 blur-[55px]',
          glowBg,
        )}
      />
      <Icon className={cn('relative size-9 shrink-0', accentText)} aria-hidden />
      <span className="relative flex w-full flex-col items-end gap-2">
        <span className="text-foreground w-full text-xl font-medium">{title}</span>
        <span className="text-foreground/60 w-full text-xs leading-normal">{subtitle}</span>
      </span>
      {comingSoonLabel ? (
        <span className="border-border bg-background/85 text-muted-foreground absolute start-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-medium">
          {comingSoonLabel}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={cn(CARD, 'cursor-not-allowed')}>{body}</div>;
  }
  return (
    <Link
      href={href}
      className={cn(
        CARD,
        'focus-visible:outline-ring transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:shadow-[0px_6px_28px_0px_rgba(0,0,0,0.14)]',
      )}
    >
      {body}
    </Link>
  );
}
