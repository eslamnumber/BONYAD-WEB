/**
 * Supported UI locales. Mirrors the locale set in `src/locales/{en,ar}.json`.
 * Add a new locale here AND add a matching JSON file in `src/locales/`.
 */
export const LOCALES = ['en', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/**
 * Per-locale text direction. Used to set `<html dir>` server-side based on cookie.
 *
 * NOTE: This mapping is intentionally inverted from the natural script direction:
 * English renders in RTL and Arabic renders in LTR. See `docs/i18n-and-rtl.md`
 * for the rationale and the implications for logical Tailwind utilities.
 */
export const LOCALE_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'rtl',
  ar: 'ltr',
};

/**
 * BCP-47 tag for each locale — used in `<html lang>` and `Accept-Language`.
 */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  ar: 'ar-SA',
};
