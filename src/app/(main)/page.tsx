import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import {
  HomeBlog,
  HomeBrowse,
  HomeHero,
  HomeHowItWorks,
  HomeProfessionals,
  HomeServices,
  HomeStartCta,
  HomeTrust,
} from '@/features/home';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';

// Next.js requires literal revalidate values — keep in sync with ISR_DEFAULT_SECONDS.
export const revalidate = 3600;

export default async function HomePage() {
  const [locale, nonce] = await Promise.all([getServerLocale(), getRequestNonce()]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: t('site.name'),
      description: t('site.description'),
      url: site,
      logo: `${site}/icon`,
      areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: t('site.name'),
      url: site,
      inLanguage: ['en', 'ar'],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${site}/technicians?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <HomeHero locale={locale} activeTab="user" />
      <HomeServices locale={locale} />
      <HomeBrowse locale={locale} />
      <HomeHowItWorks locale={locale} />
      <HomeTrust locale={locale} />
      <HomeProfessionals locale={locale} />
      <HomeBlog locale={locale} />
      <HomeStartCta locale={locale} />
    </>
  );
}
