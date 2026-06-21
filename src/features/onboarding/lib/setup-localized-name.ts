import { type Locale, LOCALE_DIRECTION } from '@/types/locale';

/**
 * The locale-appropriate name from a pair of flat `nameAr`/`nameEn` fields, under the
 * inverted direction mapping (`ar → ltr` shows Arabic, `en → rtl` shows English), each
 * falling back to the other so a partially-populated plan/service never renders blank.
 * Mirrors `features/subscriptions`' `localizedName` (rule 6 forbids importing it).
 */
export function localizedName(
  nameAr: string | null | undefined,
  nameEn: string | null | undefined,
  locale: Locale,
): string {
  const primary = LOCALE_DIRECTION[locale] === 'ltr' ? nameAr : nameEn;
  return primary ?? nameEn ?? nameAr ?? '';
}
