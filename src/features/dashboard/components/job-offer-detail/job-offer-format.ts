import { type Locale } from '@/types/locale';

/** Whole days since an ISO timestamp (for the "posted N days ago" line), or null. */
export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / 86_400_000);
  return days >= 0 ? days : null;
}

/**
 * Execution duration in whole months — the summary card shows months
 * ("12 شهراً"), while the backend stores `timeRequiredDays`. Rounds to the
 * nearest month, clamped to ≥1 for any positive duration.
 */
export function durationMonths(days: number | null | undefined): number | null {
  if (typeof days !== 'number' || days <= 0) return null;
  return Math.max(1, Math.round(days / 30));
}

/**
 * Execution duration in whole weeks — the bid card shows weeks ("4 أسابيع")
 * while the backend stores `estimatedDurationDays`. Rounds to the nearest week,
 * clamped to ≥1 for any positive duration.
 */
export function durationWeeks(days: number | null | undefined): number | null {
  if (typeof days !== 'number' || days <= 0) return null;
  return Math.max(1, Math.round(days / 7));
}

/**
 * Long localized date for the "expected start" stat ("1 أغسطس 2026" /
 * "1 August 2026"). Forces Latin digits in Arabic (`ar-u-nu-latn`) to match the
 * Figma, which renders Western numerals throughout this screen.
 */
export function formatLongDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const intlLocale = locale === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/** Month + year for the phases timeline ("سبتمبر 2026" / "September 2026"), Latin digits in ar. */
export function formatMonthYear(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const intlLocale = locale === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' }).format(d);
}

/**
 * Budget figure(s) with thousands separators, no currency marker — the SAR glyph
 * is rendered separately as `SaudiRiyalIcon` (figma-to-code §Icons rule 10).
 * Prefers an explicit min–max range, falling back to the single `budget`.
 */
export function formatBudgetRange(
  min: number | null | undefined,
  max: number | null | undefined,
  single: number | null | undefined,
): string | null {
  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  if (typeof min === 'number' && typeof max === 'number') return `${fmt(min)} - ${fmt(max)}`;
  if (typeof single === 'number') return fmt(single);
  if (typeof min === 'number') return fmt(min);
  if (typeof max === 'number') return fmt(max);
  return null;
}
