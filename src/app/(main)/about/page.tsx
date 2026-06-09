import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import { AboutHero, AboutPillars, AboutStats, AboutTimeline } from '@/features/about';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  return {
    title: t('about.meta.title'),
    description: t('about.meta.description'),
    alternates: {
      canonical: `${site}/about`,
      languages: { en: `${site}/about`, ar: `${site}/about` },
    },
    openGraph: {
      title: t('about.meta.title'),
      description: t('about.meta.description'),
      url: `${site}/about`,
      type: 'website',
      locale: 'en_SA',
      alternateLocale: 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function AboutPage() {
  const [locale, nonce] = await Promise.all([getServerLocale(), getRequestNonce()]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: t('about.meta.title'),
      description: t('about.meta.description'),
      url: `${site}/about`,
      inLanguage: ['en', 'ar'],
      isPartOf: { '@type': 'WebSite', name: t('site.name'), url: site },
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <AboutHero locale={locale} />
      <AboutPillars locale={locale} />
      <AboutTimeline locale={locale} />
      <AboutStats locale={locale} />
    </>
  );
}
