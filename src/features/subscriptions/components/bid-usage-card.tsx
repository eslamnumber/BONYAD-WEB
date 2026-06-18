'use client';

import { useTranslation } from 'react-i18next';

import type { Locale } from '@/types/locale';

import {
  type BidUsage,
  bidUsage,
  bidsPlanLabel,
  formatResetsIn,
  formatSubscriptionDate,
} from '../lib/subscription-format';
import type { SubscriptionBids } from '../schemas/subscription';

import { SubscriptionDetailRow } from './subscription-detail-row';

function BidMeter({ usage, label }: { usage: BidUsage; label: string }) {
  const unlimited = usage.quota === null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-start text-sm font-medium">{label}</span>
      {unlimited ? null : (
        <div
          role="progressbar"
          aria-valuenow={usage.remaining}
          aria-valuemin={0}
          aria-valuemax={usage.quota ?? undefined}
          aria-label={label}
          className="bg-primary/10 h-2 w-full overflow-hidden rounded-full"
        >
          <div
            className="bg-primary duration-base h-full rounded-full transition-[width]"
            style={{ width: `${usage.remainingPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Weekly bid-usage card (iOS `bidsInfoCard`) — the screen's signature element. A
 * progress meter shows how much of the plan's weekly bid quota is still available,
 * with the exact quota / remaining / reset timing below it. Returns `null` when
 * there's no quota data, so the screen simply omits the card (the quota endpoint is
 * non-critical).
 */
export function BidUsageCard({ bids, locale }: { bids: SubscriptionBids; locale: Locale }) {
  const { t } = useTranslation();
  const usage = bidUsage(bids);
  if (!usage) return null;

  const planLabel = bidsPlanLabel(bids, locale);
  const na = t('subscription.details.notAvailable');
  const unlimited = t('subscription.bids.unlimited');
  const meterLabel = usage.quota
    ? t('subscription.bids.remainingOfQuota', { remaining: usage.remaining, quota: usage.quota })
    : unlimited;
  const resetsIn = formatResetsIn(bids.secondsUntilReset, locale);

  return (
    <section className="bg-card border-border rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-foreground text-start text-base font-semibold">
          {t('subscription.bids.title')}
        </h2>
        {planLabel ? (
          <span dir="auto" className="text-muted-foreground text-xs">
            {planLabel}
          </span>
        ) : null}
      </div>

      <BidMeter usage={usage} label={meterLabel} />

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SubscriptionDetailRow
          label={t('subscription.bids.weeklyQuota')}
          value={usage.quota ?? unlimited}
        />
        <SubscriptionDetailRow label={t('subscription.bids.remaining')} value={usage.remaining} />
        <SubscriptionDetailRow
          label={t('subscription.bids.nextReset')}
          value={formatSubscriptionDate(bids.nextResetAt, locale) ?? na}
        />
        <SubscriptionDetailRow label={t('subscription.bids.resetsIn')} value={resetsIn ?? na} />
      </div>
    </section>
  );
}
