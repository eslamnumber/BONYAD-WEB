import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import {
  HomeHero,
  HomeHowItWorks,
  HomeServices,
  HomeStartCta,
  HomeTrust,
  TechBlog,
  TechPricing,
  TechSuccessStories,
} from '@/features/home';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return {
    title: `${t('tech.hero.proHeadline')} — ${t('site.name')}`,
    description: t('tech.hero.proSubheadline'),
  };
}

export default async function ForProsPage() {
  const [locale, nonce] = await Promise.all([getServerLocale(), getRequestNonce()]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${t('tech.hero.proHeadline')} — ${t('site.name')}`,
    description: t('tech.hero.proSubheadline'),
    url: `${site}/for-pros`,
    inLanguage: ['en', 'ar'],
    isPartOf: {
      '@type': 'WebSite',
      name: t('site.name'),
      url: site,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <HomeHero locale={locale} activeTab="pro" />
      <HomeServices locale={locale} variant="pro" />
      <HomeHowItWorks locale={locale} variant="pro" />
      <HomeTrust locale={locale} />
      <TechPricing locale={locale} />
      <TechSuccessStories locale={locale} />
      <TechBlog locale={locale} />
      <HomeStartCta locale={locale} variant="pro" />
    </>
  );
}
