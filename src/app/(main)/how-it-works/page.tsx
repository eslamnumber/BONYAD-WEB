import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import {
  ContactUsSection,
  getFaqs,
  HowItWorksCta,
  HowItWorksFaq,
  HowItWorksHero,
  HowItWorksSteps,
} from '@/features/how-it-works';
import { getTranslations } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';
import { LOCALE_DIRECTION } from '@/types/locale';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  return {
    title: t('howItWorks.meta.title'),
    description: t('howItWorks.meta.description'),
    alternates: {
      canonical: `${site}/how-it-works`,
      languages: { en: `${site}/how-it-works`, ar: `${site}/how-it-works` },
    },
    openGraph: {
      title: t('howItWorks.meta.title'),
      description: t('howItWorks.meta.description'),
      url: `${site}/how-it-works`,
      type: 'website',
      locale: 'en_SA',
      alternateLocale: 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function HowItWorksPage() {
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
      name: t('howItWorks.meta.title'),
      description: t('howItWorks.meta.description'),
      url: `${site}/how-it-works`,
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
        acceptedAnswer: {
          '@type': 'Answer',
          text: isAr ? faq.answerAr : faq.answerEn,
        },
      })),
    });
  }

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <HowItWorksHero locale={locale} />
      <HowItWorksSteps locale={locale} />
      <ContactUsSection locale={locale} />
      <HowItWorksFaq locale={locale} faqs={faqs} />
      <HowItWorksCta locale={locale} />
    </>
  );
}
