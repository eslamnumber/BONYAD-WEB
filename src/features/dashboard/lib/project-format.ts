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
 * Grouped SAR budget figure: 200000 → "200,000". Fixed `en-US` digits to match the
 * Figma's Western numerals (these screens render Western digits, not Eastern-Arabic);
 * the Saudi Riyal glyph is rendered separately as an icon, not a text suffix.
 */
export function formatBudget(budget: number): string {
  return new Intl.NumberFormat('en-US').format(budget);
}

/**
 * Short project date for the list table: ISO → "10 سبتمبر" / "10 September".
 * Day + full month name, no year (matches the Figma cells). Forces Latin numerals
 * in Arabic (`ar-u-nu-latn`) so the table reads Western digits like the rest of
 * these screens (see {@link formatBudget}). Returns "—" for a missing/invalid date.
 */
export function formatProjectDate(iso: string | undefined, locale: Locale): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const intlLocale = locale === 'ar' ? 'ar-u-nu-latn' : 'en';
  return new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'long' }).format(date);
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
