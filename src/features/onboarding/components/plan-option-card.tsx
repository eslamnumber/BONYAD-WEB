'use client';

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { type Locale } from '@/types/locale';

import { localizedName } from '../lib/setup-localized-name';
import type { SetupPlan } from '../schemas/setup';

const K = 'onboarding.setup.plan';

/** A selectable subscription plan — the dashboard subscriptions card language (price tag
 *  + per-week bids pill) made a toggle button with a selected ring + check. */
export function PlanOptionCard({
  plan,
  locale,
  selected,
  onSelect,
}: {
  plan: SetupPlan;
  locale: Locale;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const name = localizedName(plan.nameAr, plan.nameEn, locale);
  const amount = Math.round(plan.finalPrice ?? plan.price ?? 0);
  const bids = plan.bidsPerWeek ?? null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`focus-visible:outline-ring flex w-full items-start justify-between gap-4 rounded-2xl border p-5 text-start shadow-sm transition-colors focus-visible:outline-2 ${
        selected
          ? 'border-primary ring-primary/30 bg-card ring-2'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <div className="flex flex-col items-start gap-2">
        <span dir="auto" className="text-foreground text-lg font-semibold">
          {name}
        </span>
        {bids === null ? null : (
          <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
            {t(`${K}.perWeekBids`, { count: bids })}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <PlanPrice
          amount={amount}
          currency={t('subscription.currency')}
          freeLabel={t(`${K}.free`)}
        />
        <SelectionDot selected={selected} />
      </div>
    </button>
  );
}

function PlanPrice({
  amount,
  currency,
  freeLabel,
}: {
  amount: number;
  currency: string;
  freeLabel: string;
}) {
  if (amount <= 0) return <span className="text-primary text-sm font-semibold">{freeLabel}</span>;
  return (
    <span className="flex items-end gap-1">
      <SaudiRiyalIcon className="text-primary mb-1 h-4 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{currency}</span>
      <span className="text-primary text-2xl leading-none font-bold">{amount}</span>
    </span>
  );
}

function SelectionDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
      }`}
    >
      {selected ? <Check className="size-4" /> : null}
    </span>
  );
}
