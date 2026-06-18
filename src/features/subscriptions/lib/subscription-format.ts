import { type Locale, LOCALE_DIRECTION, LOCALE_TAG } from '@/types/locale';

import type { SubscriptionBids, SubscriptionCategory } from '../schemas/subscription';

/** Pick the locale-appropriate name from two flat fields under the inverted mapping. */
function localizedName(
  arName: string | null | undefined,
  enName: string | null | undefined,
  locale: Locale,
): string {
  const primary = LOCALE_DIRECTION[locale] === 'ltr' ? arName : enName;
  return primary ?? enName ?? arName ?? '';
}

/**
 * Localized plan name under the inverted direction mapping (`ar → ltr`): the Arabic
 * locale shows `nameAr`, English shows `nameEn`, each falling back to the other so a
 * partially-populated category never renders blank.
 */
export function planName(
  category: SubscriptionCategory | null | undefined,
  locale: Locale,
): string {
  if (!category) return '';
  return localizedName(category.nameAr, category.nameEn, locale);
}

/** Localized plan name from the flat bid-quota payload (mirrors {@link planName}). */
export function bidsPlanLabel(bids: SubscriptionBids, locale: Locale): string {
  return localizedName(bids.subscriptionCategoryNameAr, bids.subscriptionCategoryNameEn, locale);
}

/** A localized day-month-year date, or `null` when the ISO string is missing/invalid. */
export function formatSubscriptionDate(
  iso: string | null | undefined,
  locale: Locale,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** A localized relative "resets in" string (e.g. "in 3 days"), or `null` when past/absent. */
export function formatResetsIn(seconds: number | null | undefined, locale: Locale): string | null {
  if (seconds === null || seconds === undefined || seconds <= 0) return null;
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAG[locale], { numeric: 'auto' });
  const days = Math.floor(seconds / 86_400);
  if (days >= 1) return rtf.format(days, 'day');
  const hours = Math.floor(seconds / 3_600);
  if (hours >= 1) return rtf.format(hours, 'hour');
  return rtf.format(Math.max(1, Math.floor(seconds / 60)), 'minute');
}

/** Normalized weekly-bid usage for the progress meter. `quota === null` → unlimited. */
export type BidUsage = { remaining: number; quota: number | null; remainingPct: number };

export function bidUsage(bids: SubscriptionBids | null | undefined): BidUsage | null {
  if (!bids) return null;
  const remaining = Math.max(0, bids.bidsRemaining ?? 0);
  const quota = bids.weeklyQuota ?? null;
  if (quota === null || quota <= 0) return { remaining, quota: null, remainingPct: 100 };
  const clamped = Math.min(remaining, quota);
  return { remaining: clamped, quota, remainingPct: Math.round((clamped / quota) * 100) };
}
