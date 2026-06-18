'use client';

import { useTranslation } from 'react-i18next';

/**
 * Direction for the portfolio screen — a deliberate **per-screen override** of the
 * app's inverted `en→rtl` / `ar→ltr` map (`LOCALE_DIRECTION`). The user asked the
 * portfolio surface to read like a conventional app: **LTR in English, RTL in Arabic**.
 * Applied as a `dir` on the screen root + each portaled modal; inside, alignment uses
 * `text-start` so content sits on the reading start in both locales.
 */
export function usePortfolioDir(): 'rtl' | 'ltr' {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith('ar') ? 'rtl' : 'ltr';
}
