import { type Locale, LOCALE_DIRECTION } from '@/types/locale';

/**
 * A technician service (category or subcategory). Mirrors `Service` from
 * website-bonyad/src/services/TechnicianServiceService.ts — permissive (only `id`
 * required) so a future backend field never surfaces as a misleading error. Names
 * arrive as a flat `nameEn`/`nameAr` pair, read via {@link localizedName}.
 */
export type Service = {
  id: number;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  iconUrl?: string | null;
  isCategory?: boolean;
  parentService?: { id: number; nameEn?: string; nameAr?: string } | null;
};

/**
 * The locale-appropriate name from the flat `nameAr`/`nameEn` pair, under the
 * inverted direction mapping (`ar → ltr` shows Arabic, `en → rtl` shows English),
 * each falling back to the other so a partially-populated service never renders
 * blank. Mirrors `features/onboarding`'s `localizedName` (rule 6 forbids importing it).
 */
export function localizedName(
  nameAr: string | null | undefined,
  nameEn: string | null | undefined,
  locale: Locale,
): string {
  const primary = LOCALE_DIRECTION[locale] === 'ltr' ? nameAr : nameEn;
  return primary ?? nameEn ?? nameAr ?? '';
}
