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
 * Intentional inversion: English is RTL, Arabic is LTR (product decision).
 */
export const LOCALE_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'rtl',
  ar: 'ltr',
};

/**
 * Conventional (non-inverted) direction — English LTR, Arabic RTL. The OPPOSITE of
 * {@link LOCALE_DIRECTION}. Two legitimate uses, both narrow:
 *   1. Screen-wide opt-out at explicit product request (currently `features/support` and
 *      `features/feedback`) — a scoped `dir` on that screen's root + its portalled modals.
 *   2. A single free-text input's *writing* direction, when the user fills it in their own
 *      UI language (a reply / note / description). `dir="auto"` defaults an EMPTY field to
 *      LTR (it reads the value, not the placeholder), so under the inverted map an Arabic
 *      field's placeholder + caret land on the wrong side; `dir={conventionalDirection(locale)}`
 *      fixes the empty state without touching layout. See docs/i18n-and-rtl.md RTL rule 4.
 * Do NOT use it as a general layout default — the app-wide direction stays `LOCALE_DIRECTION`.
 */
export const CONVENTIONAL_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

export const conventionalDirection = (locale: Locale): 'ltr' | 'rtl' =>
  CONVENTIONAL_DIRECTION[locale];

/**
 * BCP-47 tag for each locale — used in `<html lang>` and `Accept-Language`.
 */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  ar: 'ar-SA',
};
