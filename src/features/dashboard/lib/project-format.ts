import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import type { Project } from '../schemas/project';

/**
 * Resolve the localized service name. The backend returns a split
 * (`serviceNameEn` / `serviceNameAr`); pick per locale via `LOCALE_DIRECTION`
 * (the project's inverted en→rtl / ar→ltr mapping), falling back to whichever
 * side is present so a half-populated record still shows a label.
 */
export function localizedServiceName(
  project: Pick<Project, 'serviceNameEn' | 'serviceNameAr'>,
  locale: Locale,
): string | undefined {
  const en = project.serviceNameEn?.trim() || undefined;
  const ar = project.serviceNameAr?.trim() || undefined;
  const primary = LOCALE_DIRECTION[locale] === 'ltr' ? ar : en;
  return primary ?? en ?? ar;
}

/**
 * Compact budget for the project-card footer: 800000 → "800K", 3000000 → "3M".
 * Fixed `en-US` formatting to match the Figma's Western-numeral compact figures
 * (the rest of this screen renders Western digits, not Eastern-Arabic).
 */
export function formatBudgetCompact(budget: number | null | undefined): string | null {
  if (typeof budget !== 'number') return null;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(budget);
}

/**
 * Bid duration in whole weeks. Mirrors the RN call site
 * (`Math.ceil(timeRequiredDays / 7)`) — `timeRequired` is stored in days.
 */
export function durationWeeks(timeRequiredDays: number | null | undefined): number | null {
  if (typeof timeRequiredDays !== 'number') return null;
  return Math.ceil(timeRequiredDays / 7);
}

/** Whole days until the bid deadline, or null when absent/already closed. */
export function daysRemaining(bidsCloseAt: string | null | undefined): number | null {
  if (!bidsCloseAt) return null;
  const close = new Date(bidsCloseAt).getTime();
  if (Number.isNaN(close)) return null;
  const days = Math.ceil((close - Date.now()) / 86_400_000);
  return days > 0 ? days : null;
}
