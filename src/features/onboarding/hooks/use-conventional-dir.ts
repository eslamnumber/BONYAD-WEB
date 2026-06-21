'use client';

import { useTranslation } from 'react-i18next';

import { conventionalDirection } from '@/types/locale';

/**
 * The current locale's natural ("conventional") writing direction — `ar → rtl`,
 * `en → ltr` — the OPPOSITE of the app's inverted layout map. Scope it via `dir={…}`
 * on a container so the subtree reads in true order (a leading icon sits on the
 * reading-start side) using plain `flex` + logical CSS, with NO `flex-row-reverse`
 * and no hand-flipped `text-start`/`text-end`. Mirrors the feedback / support idiom.
 */
export function useConventionalDir(): 'ltr' | 'rtl' {
  const { i18n } = useTranslation();
  return conventionalDirection(i18n.language.startsWith('ar') ? 'ar' : 'en');
}
