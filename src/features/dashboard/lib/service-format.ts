import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { type Service } from '../schemas/service';

/**
 * Localized service-category name under the inverted en→rtl mapping: Arabic copy
 * is primary when the document renders LTR (`ar`), English otherwise, with a
 * fallback chain down to the id. Shared by the category picker and the review step.
 */
export function localizedServiceName(service: Service, locale: Locale): string {
  const en = service.nameEn?.trim() || undefined;
  const ar = service.nameAr?.trim() || undefined;
  const primary = LOCALE_DIRECTION[locale] === 'ltr' ? ar : en;
  return primary ?? en ?? ar ?? String(service.id);
}
