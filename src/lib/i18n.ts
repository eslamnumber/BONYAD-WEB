'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import { type Locale } from '@/types/locale';

/**
 * Client-side i18next singleton.
 *
 * Initialized exactly ONCE per browser tab — repeat calls are no-ops that
 * switch the active language if needed. Server-side translation does NOT go
 * through this; see `src/lib/get-translations.ts`.
 */

let initialized = false;

export function initI18n(initialLocale: Locale): typeof i18n {
  if (initialized) {
    return i18n;
  }
  initialized = true;

  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initialLocale,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  return i18n;
}

export { i18n };
