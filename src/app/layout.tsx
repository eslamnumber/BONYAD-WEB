import type { Metadata, Viewport } from 'next';

import { RouteAnnouncer } from '@/components/feedback';
import { env } from '@/config/env';
import { arabicFont, sansFont } from '@/lib/fonts';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';
import { LOCALE_DIRECTION, LOCALE_TAG } from '@/types/locale';

import { Providers } from './providers';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: t('site.name'), template: `%s — ${t('site.name')}` },
    description: t('site.description'),
    applicationName: t('site.name'),
    openGraph: {
      type: 'website',
      siteName: t('site.name'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_SA',
      alternateLocale: locale === 'ar' ? 'en_SA' : 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  colorScheme: 'light dark',
};

type RootLayoutProps = { children: React.ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const [locale, nonce] = await Promise.all([getServerLocale(), getRequestNonce()]);
  const lang = LOCALE_TAG[locale];
  const dir = LOCALE_DIRECTION[locale];

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${sansFont.variable} ${arabicFont.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <Providers initialLocale={locale} nonce={nonce}>
          <RouteAnnouncer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
