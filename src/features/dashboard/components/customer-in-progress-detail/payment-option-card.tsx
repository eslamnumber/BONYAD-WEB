'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Per-option accent (Figma 1547:7652): full = purple #8A38F5, partial = navy #003867. */
type Accent = 'full' | 'partial';

const ACCENT: Record<Accent, { border: string; radio: string }> = {
  full: { border: 'border-status-bid', radio: 'border-status-bid' },
  partial: { border: 'border-brand-dark-navy', radio: 'border-brand-dark-navy' },
};

type Props = {
  accent: Accent;
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  recommended?: boolean;
  /** Amount row (full) or the custom-amount input (partial) — rendered below the
   *  selectable button so an <input> is never nested inside a <button>. */
  children?: ReactNode;
};

/**
 * One selectable payment option in the choose-payment modal (Figma node 1547:7661
 * / 1547:7669). A `role="radio"` button (radio dot + title + description) with the
 * option's accent border, plus an optional "Recommended" tag and a below-button
 * slot for the amount / input.
 */
export function PaymentOptionCard({
  accent,
  selected,
  onSelect,
  title,
  description,
  recommended,
  children,
}: Props) {
  const a = ACCENT[accent];
  return (
    <div className={`bg-card rounded-xl border ${a.border}`}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="focus-visible:outline-ring flex w-full flex-col gap-2 rounded-xl p-4 text-start focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        {recommended ? <RecommendedBadge /> : null}
        <div className="flex w-full items-center justify-between gap-2">
          <RadioDot selected={selected} accent={a.radio} />
          <span className="text-brand-dark-navy text-base font-medium">{title}</span>
        </div>
        <p className="text-muted-foreground w-full text-start text-[13px]" dir="auto">
          {description}
        </p>
      </button>
      {children ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

/** Radio indicator: a 20px ring; selected = a thick accent ring, else a grey outline. */
function RadioDot({ selected, accent }: { selected: boolean; accent: string }) {
  return (
    <span
      aria-hidden
      className={`size-5 shrink-0 rounded-full ${selected ? `${accent} border-[6px]` : 'border-border border-2'}`}
    />
  );
}

/** "Recommended" pill at the top inline-end of the card (Figma node 1547:7682).
 *  Rendered in normal flow as the card's first row — `self-end` anchors it to the
 *  inline-end — so it can't float off the border or get clipped like an absolute tag. */
function RecommendedBadge() {
  const { t } = useTranslation();
  return (
    <span className="bg-status-bid-soft text-status-bid -mt-0.5 self-end rounded-full px-2.5 py-1 text-[9px] leading-none font-semibold whitespace-nowrap">
      {t('dashboard.payment.options.recommended')}
    </span>
  );
}
