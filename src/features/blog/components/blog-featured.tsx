import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { pickBadgeClasses } from './badge-color';
import { type BlogCardVM } from './blog-card-vm';

type BlogFeaturedProps = { locale: Locale; card: BlogCardVM | null };

export function BlogFeatured({ locale, card }: BlogFeaturedProps) {
  if (!card) return null;
  const { t } = getTranslations(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Link
        href={card.href}
        className="group bg-card relative block overflow-hidden rounded-[4px] border border-slate-300 transition-shadow duration-200 motion-safe:hover:shadow-md"
      >
        <div className="relative aspect-[1280/534] w-full lg:aspect-auto lg:h-[534px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageSrc}
            alt={card.title}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="bg-card relative flex flex-col items-end gap-6 px-5 py-4 sm:px-6 lg:absolute lg:end-[29px] lg:top-[245px] lg:w-[678px] lg:px-6 lg:py-4">
          <div className="flex w-full flex-col items-end gap-4">
            <span
              className={`inline-flex items-center justify-center rounded-full px-[10px] py-1 text-base font-bold ${pickBadgeClasses(card.badgeTag)}`}
            >
              {card.badgeLabel}
            </span>
            <h2 className="text-foreground w-full text-end text-2xl font-semibold sm:text-[28px] lg:text-[32px] lg:leading-tight">
              {card.title}
            </h2>
            {card.summary ? (
              <p className="text-foreground/60 w-full text-end text-base tracking-[0.15px]">
                {card.summary}
              </p>
            ) : null}
          </div>
          <span className="text-brand-dark-navy inline-flex items-center gap-2 text-base font-semibold tracking-[0.1px]">
            <ChevronRight className="size-5 ltr:-scale-x-100" aria-hidden />
            {t('blog.readMore')}
          </span>
        </div>
      </Link>
    </section>
  );
}
