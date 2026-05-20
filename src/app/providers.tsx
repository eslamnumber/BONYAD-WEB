'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
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

export function Providers({ children, initialLocale, nonce }: ProvidersProps) {
  const [i18n] = useState(() => initI18n(initialLocale));
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );

  useEffect(() => {
    if (i18n.language !== initialLocale) {
      void i18n.changeLanguage(initialLocale);
    }
  }, [i18n, initialLocale]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey={THEME_COOKIE_NAME}
        nonce={nonce}
      >
        <I18nextProvider i18n={i18n}>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </I18nextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
