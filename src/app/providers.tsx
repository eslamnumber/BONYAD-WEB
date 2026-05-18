'use client';

import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';

import { THEME_COOKIE_NAME } from '@/config/constants';
import { initI18n } from '@/lib/i18n';
import { type Locale } from '@/types/locale';

type ProvidersProps = {
  children: React.ReactNode;
  /** Locale resolved server-side from the `bonyad-lang` cookie. */
  initialLocale: Locale;
  /** CSP nonce from middleware — forwarded to provider-emitted scripts. */
  nonce?: string;
};

/**
 * Client-side providers tree.
 *
 *  - `next-themes` ThemeProvider (light / dark / system).
 *  - `I18nextProvider` — initializes the i18next singleton with the server-known
 *    initial locale, then provides it to `useTranslation()` callers.
 *
 * Will gain in later phases:
 *   - QueryClientProvider (when backend integration lands).
 *   - TooltipProvider, sonner Toaster (when those primitives are added).
 */
export function Providers({ children, initialLocale, nonce }: ProvidersProps) {
  const i18n = useMemo(() => initI18n(initialLocale), [initialLocale]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_COOKIE_NAME}
      nonce={nonce}
    >
      <I18nextProvider i18n={i18n}>
        {/* Honour prefers-reduced-motion globally for framer-motion components
            (e.g. the hero toggle pill). */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </I18nextProvider>
    </ThemeProvider>
  );
}
