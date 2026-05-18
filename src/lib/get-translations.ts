import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import { type Locale } from '@/types/locale';

const dictionaries = { en, ar } as const;

/**
 * Source-of-truth English dictionary. Use its shape to type-check translation
 * keys when needed: `type Dict = typeof en;`
 */
export type Dict = typeof en;

export type TFunction = (key: string) => string;

/**
 * Synchronous server-side translation helper.
 *
 * Call from Server Components, route handlers, and `generateMetadata`.
 * Returns a `t(key)` function that walks dotted paths into the locale's JSON.
 * Missing keys return the key itself — useful for spotting drift in dev.
 *
 * Example:
 *   const { t } = getTranslations(locale);
 *   t('nav.services')  // → "Services" (en) or "الخدمات" (ar)
 *
 * Client components: use `useTranslation()` from react-i18next instead.
 */
export function getTranslations(locale: Locale): { t: TFunction; dict: Dict } {
  const dict = (dictionaries[locale] ?? dictionaries.en) as Dict;
  const t: TFunction = (key) => resolvePath(dict, key) ?? key;
  return { t, dict };
}

function resolvePath(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let cursor: unknown = obj;
  for (const part of parts) {
    if (typeof cursor !== 'object' || cursor === null || !(part in (cursor as object))) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return typeof cursor === 'string' ? cursor : undefined;
}
