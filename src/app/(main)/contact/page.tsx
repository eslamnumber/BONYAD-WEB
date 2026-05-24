import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import { ContactHero } from '@/features/contact';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  return {
    title: t('contact.meta.title'),
    description: t('contact.meta.description'),
    alternates: {
      canonical: `${site}/contact`,
      languages: { en: `${site}/contact`, ar: `${site}/contact` },
    },
    openGraph: {
      title: t('contact.meta.title'),
      description: t('contact.meta.description'),
      url: `${site}/contact`,
      type: 'website',
      locale: 'en_SA',
      alternateLocale: 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ContactPage() {
  const [locale, nonce] = await Promise.all([getServerLocale(), getRequestNonce()]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: t('contact.meta.title'),
      description: t('contact.meta.description'),
      url: `${site}/contact`,
      inLanguage: ['en', 'ar'],
      isPartOf: { '@type': 'WebSite', name: t('site.name'), url: site },
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <ContactHero locale={locale} />
    </>
  );
}
