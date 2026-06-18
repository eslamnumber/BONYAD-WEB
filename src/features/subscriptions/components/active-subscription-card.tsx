'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import type { Locale } from '@/types/locale';

import { formatSubscriptionDate, planName } from '../lib/subscription-format';
import type { Subscription, SubscriptionCategory } from '../schemas/subscription';

import { SubscriptionDetailRow } from './subscription-detail-row';

function PriceTag({ amount, currency }: { amount: number; currency: string }) {
  return (
    <div className="flex shrink-0 items-end gap-1.5">
      <SaudiRiyalIcon className="text-primary mb-1 h-5 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{currency}</span>
      <span className="text-primary text-3xl leading-none font-bold">{amount}</span>
    </div>
  );
}

function PlanSummary({ name, bidsPerWeek }: { name: string; bidsPerWeek: number | null }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-start gap-2">
      <h2 dir="auto" className="text-foreground text-start text-lg font-semibold">
        {name}
      </h2>
      {bidsPerWeek === null ? null : (
        <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
          {t('subscription.active.perWeekBids', { count: bidsPerWeek })}
        </span>
      )}
    </div>
  );
}

function DetailGrid({ subscription, locale }: { subscription: Subscription; locale: Locale }) {
  const { t } = useTranslation();
  const na = t('subscription.details.notAvailable');
  const days = subscription.daysRemaining ?? null;
  const pill = (
    <span className="bg-status-approved-soft text-status-approved inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium">
      {t('subscription.details.statusActive')}
    </span>
  );
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <SubscriptionDetailRow
        label={t('subscription.details.startDate')}
        value={formatSubscriptionDate(subscription.startDate, locale) ?? na}
      />
      <SubscriptionDetailRow
        label={t('subscription.details.endDate')}
        value={formatSubscriptionDate(subscription.endDate, locale) ?? na}
      />
      <SubscriptionDetailRow
        label={t('subscription.details.daysRemaining')}
        value={days === null ? na : t('subscription.details.daysValue', { count: days })}
      />
      <SubscriptionDetailRow label={t('subscription.details.status')} value={pill} />
    </div>
  );
}

function resolvePrice(category: SubscriptionCategory | null): number {
  return Math.round(category?.price ?? category?.finalPrice ?? 0);
}

/**
 * The active-subscription detail card (iOS `activeSubscriptionView`): the plan name
 * and price up top, then a two-column grid of start date, renewal/end date, days
 * remaining, and an "Active" status pill. Degrades gracefully — every field is
 * nullable, so a just-activated plan whose category is still hydrating shows the
 * "being activated" name and a "—" for any missing value rather than a broken card.
 */
export function ActiveSubscriptionCard({
  subscription,
  locale,
}: {
  subscription: Subscription;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const category = subscription.subscriptionCategory ?? null;
  const name = planName(category, locale) || t('subscription.active.activating');
  const amount = resolvePrice(category);

  return (
    <section className="bg-card border-border rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <PlanSummary name={name} bidsPerWeek={category?.bidsPerWeek ?? null} />
        {amount > 0 ? <PriceTag amount={amount} currency={t('subscription.currency')} /> : null}
      </div>
      <div className="bg-border my-5 h-px w-full" aria-hidden />
      <DetailGrid subscription={subscription} locale={locale} />
    </section>
  );
}
