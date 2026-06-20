'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { CloseIcon, PhaseCheckIcon, SaudiRiyalIcon } from '@/components/icons';

/**
 * SowCard chrome variant. `'review'` (default) is the create-flow / collapsible-panel
 * look — accent icon chip + underlined header. `'plain'` drops the icon and uses the
 * status-screen sibling chrome (heading + full-width divider, `p-6`) so the AI cards
 * match the description / phases / images cards when laid out inline on the detail
 * screen. Selected per-tree via {@link SowCardVariantProvider}, so the shared section
 * components stay variant-agnostic.
 */
type SowCardVariant = 'review' | 'plain';
const SowCardVariantContext = createContext<SowCardVariant>('review');

export function SowCardVariantProvider({
  variant,
  children,
}: {
  variant: SowCardVariant;
  children: ReactNode;
}) {
  return (
    <SowCardVariantContext.Provider value={variant}>{children}</SowCardVariantContext.Provider>
  );
}

/** A section card — the repeating surface of the SOW. Chrome follows the active variant. */
export function SowCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  if (useContext(SowCardVariantContext) === 'plain') {
    return (
      <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
        <div className="flex w-full flex-col gap-3">
          <h2 className="text-foreground text-start text-lg font-semibold">{title}</h2>
          <div className="bg-border h-px w-full" />
        </div>
        {children}
      </section>
    );
  }
  return (
    <section className="border-border bg-card rounded-xl border p-5 sm:p-6">
      <div className="border-border mb-4 flex items-center gap-3 border-b pb-3">
        {icon ? (
          <span className="bg-job-accent/10 text-job-accent flex size-9 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[18px]">
            {icon}
          </span>
        ) : null}
        <h2 className="text-foreground text-start text-base font-semibold sm:text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** Currency token (SAR · ريال · ر.س · ﷼) and a pure-money body (digits, ranges, separators). */
const CURRENCY_RE = /(SAR|ريال|ر\.?\s?س\.?|﷼)/i;
const MONEY_BODY_RE = /^[\d.,\s٠-٩–\-+]+$/;

/**
 * Render a possibly-money string: when the value is a number/range plus a currency
 * token (e.g. an AI-written `"30000–35000 SAR"`), swap the token for the Saudi-Riyal
 * mark. Prose (anything but a pure money body) passes through unchanged, so this is
 * safe to use on any free-text value.
 */
export function CurrencyText({ value }: { value: string }) {
  const match = value.match(CURRENCY_RE);
  const body = match ? value.replace(CURRENCY_RE, '').replace(/\s+/g, ' ').trim() : '';
  if (!match || !MONEY_BODY_RE.test(body)) return <>{value}</>;
  return (
    <span dir="ltr" className="inline-flex items-center gap-1 tabular-nums">
      {body}
      <SaudiRiyalIcon className="size-[0.95em] shrink-0" aria-label={match[1]} />
    </span>
  );
}

/** A label → value row. Dynamic value carries `dir="auto"` (it may be AR or EN). */
export function KeyValueRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="border-border flex flex-col gap-0.5 border-b py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground text-start text-sm">{label}</dt>
      <dd dir="auto" className="text-foreground text-start text-sm font-medium sm:text-end">
        <CurrencyText value={value} />
      </dd>
    </div>
  );
}

const MARKERS = {
  check: <PhaseCheckIcon className="text-success mt-0.5 size-4 shrink-0" aria-hidden />,
  cross: <CloseIcon className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden />,
  dot: <span className="bg-job-accent mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden />,
} as const;

/** A marked list of strings (check / cross / dot). Returns null when empty. */
export function BulletList({
  items,
  marker = 'dot',
}: {
  items: string[];
  marker?: keyof typeof MARKERS;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-start gap-2.5">
          {MARKERS[marker]}
          <span dir="auto" className="text-foreground/90 text-start text-sm leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A small rounded tag. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="border-border bg-secondary/60 text-secondary-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

/** An amount + currency, kept LTR (numbers never mirror). */
export function AmountText({ value, currency }: { value: string; currency: string }) {
  if (!value) return null;
  return (
    <span dir="ltr" className="inline-flex items-center gap-1 font-semibold tabular-nums">
      {value}
      <SaudiRiyalIcon className="size-[0.95em] shrink-0" aria-label={currency} />
    </span>
  );
}
