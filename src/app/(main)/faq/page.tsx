import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import { getFaqs, HowItWorksFaq } from '@/features/how-it-works';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';
import { LOCALE_DIRECTION } from '@/types/locale';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  return {
    title: t('howItWorks.faq.meta.title'),
    description: t('howItWorks.faq.meta.description'),
    alternates: {
      canonical: `${site}/faq`,
      languages: { en: `${site}/faq`, ar: `${site}/faq` },
    },
    openGraph: {
      title: t('howItWorks.faq.meta.title'),
      description: t('howItWorks.faq.meta.description'),
      url: `${site}/faq`,
      type: 'website',
      locale: 'en_SA',
      alternateLocale: 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function FaqPage() {
  const [locale, nonce, faqs] = await Promise.all([
    getServerLocale(),
    getRequestNonce(),
    getFaqs().catch(() => []),
  ]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;
  const isAr = LOCALE_DIRECTION[locale] === 'ltr';

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('howItWorks.faq.meta.title'),
      description: t('howItWorks.faq.meta.description'),
      url: `${site}/faq`,
      inLanguage: ['en', 'ar'],
      isPartOf: { '@type': 'WebSite', name: t('site.name'), url: site },
    },
  ];

  if (faqs.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: isAr ? faq.questionAr : faq.questionEn,
        acceptedAnswer: { '@type': 'Answer', text: isAr ? faq.answerAr : faq.answerEn },
      })),
    });
  }

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <HowItWorksFaq locale={locale} faqs={faqs} />
    </>
  );
}
