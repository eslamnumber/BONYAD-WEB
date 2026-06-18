import { type Locale } from '@/types/locale';

/**
 * Transaction timestamp → localized date + time. ISO in → "10 Jun 2026, 12:30 PM".
 * Forces Latin numerals in Arabic (`ar-u-nu-latn`) so the list reads Western digits
 * like the rest of the dashboard (see project-format `formatProjectDate`). Returns
 * "—" for a missing/invalid date.
 */
export function formatTransactionDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const intlLocale = locale === 'ar' ? 'ar-u-nu-latn' : 'en';
  return new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
