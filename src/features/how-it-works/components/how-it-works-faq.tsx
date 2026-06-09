import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { type Faq } from '../schemas/faq';

import { HowItWorksFaqClient } from './how-it-works-faq-client';

type Props = { locale: Locale; faqs: Faq[]; limit?: number };

export function HowItWorksFaq({ locale, faqs, limit }: Props) {
  if (faqs.length === 0) return null;

  const { t } = getTranslations(locale);
  const isAr = LOCALE_DIRECTION[locale] === 'ltr';

  const visible = limit === undefined ? faqs : faqs.slice(0, limit);
  const hasMore = limit !== undefined && faqs.length > limit;

  const items = visible.map((faq) => ({
    id: faq.id,
    question: isAr ? faq.questionAr : faq.questionEn,
    answer: isAr ? faq.answerAr : faq.answerEn,
  }));

  return (
    <section className="bg-muted py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-[46px]">
        <div className="lg:max-w-[567px] lg:flex-1">
          <HowItWorksFaqClient items={items} />
          {hasMore && (
            <Link
              href={ROUTES.FAQ}
              className="border-primary text-primary motion-safe:hover:bg-primary motion-safe:hover:text-primary-foreground mt-8 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-base font-semibold transition-colors duration-200"
            >
              {t('howItWorks.faq.showMore')}
              <ChevronDown className="size-5 shrink-0" aria-hidden />
            </Link>
          )}
        </div>
        <div className="flex items-center justify-center lg:flex-1">
          <h2 className="text-primary text-[clamp(1.125rem,2.8vw,2.5rem)] font-medium whitespace-nowrap">
            {t('howItWorks.faq.heading')}
          </h2>
        </div>
      </div>
    </section>
  );
}
