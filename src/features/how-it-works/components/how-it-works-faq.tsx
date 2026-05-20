import { getTranslations } from '@/lib/get-translations';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { type Faq } from '../schemas/faq';

import { HowItWorksFaqClient } from './how-it-works-faq-client';

type Props = { locale: Locale; faqs: Faq[] };

export function HowItWorksFaq({ locale, faqs }: Props) {
  if (faqs.length === 0) return null;

  const { t } = getTranslations(locale);
  const isAr = LOCALE_DIRECTION[locale] === 'ltr';

  const items = faqs.map((faq) => ({
    id: faq.id,
    question: isAr ? faq.questionAr : faq.questionEn,
    answer: isAr ? faq.answerAr : faq.answerEn,
  }));

  return (
    <section className="bg-muted py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-[46px]">
        <div className="lg:max-w-[567px] lg:flex-1">
          <HowItWorksFaqClient items={items} />
        </div>
        <div className="flex items-center justify-center lg:flex-1">
          <h2 className="text-primary text-4xl font-medium xl:text-[64px]">
            {t('howItWorks.faq.heading')}
          </h2>
        </div>
      </div>
    </section>
  );
}
