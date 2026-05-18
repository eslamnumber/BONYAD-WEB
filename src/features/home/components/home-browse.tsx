import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import {
  Browse1Icon,
  Browse2Icon,
  Browse3Icon,
  Browse4Icon,
  Browse5Icon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeBrowseProps = { locale: Locale };

type BrowseIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const BROWSE_ICONS: BrowseIconComponent[] = [
  Browse1Icon,
  Browse2Icon,
  Browse3Icon,
  Browse4Icon,
  Browse5Icon,
];

type ServiceCardProps = {
  title: string;
  body: string;
  viewMoreLabel: string;
  href: string;
  Icon: BrowseIconComponent;
};

function ServiceCard({ title, body, viewMoreLabel, href, Icon }: ServiceCardProps) {
  return (
    <div className="group relative flex h-[376px] w-[350px] shrink-0 flex-col overflow-hidden rounded-[4px] border border-border bg-white p-5 backdrop-blur-[5px] transition-shadow duration-200 motion-safe:hover:shadow-md">
      <div aria-hidden className="absolute end-[19px] top-[38px]">
        <Icon className="size-[45px]" />
      </div>
      {/* Decorative accent shape — bottom trailing corner */}
      <div aria-hidden className="pointer-events-none absolute start-[248px] top-[243px] h-[198px] w-[110px] -scale-y-100 rotate-180">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/browse/card-accent-1.svg" alt="" className="block size-full" />
      </div>
      <div className="mt-[115px] flex flex-col gap-5 text-start">
        <h3 className="text-2xl font-medium text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-brand-navy transition-colors duration-200 motion-safe:hover:underline"
      >
        {viewMoreLabel}
      </Link>
    </div>
  );
}

export function HomeBrowse({ locale }: HomeBrowseProps) {
  const { t } = getTranslations(locale);
  const viewMore = t('home.browse.viewMore');

  const cards = [
    { key: '1', title: t('home.browse.card1Title'), body: t('home.browse.card1Body'), Icon: BROWSE_ICONS[0]! },
    { key: '2', title: t('home.browse.card2Title'), body: t('home.browse.card2Body'), Icon: BROWSE_ICONS[1]! },
    { key: '3', title: t('home.browse.card3Title'), body: t('home.browse.card3Body'), Icon: BROWSE_ICONS[2]! },
    { key: '4', title: t('home.browse.card4Title'), body: t('home.browse.card4Body'), Icon: BROWSE_ICONS[3]! },
    { key: '5', title: t('home.browse.card5Title'), body: t('home.browse.card5Body'), Icon: BROWSE_ICONS[4]! },
  ];

  return (
    <section className="bg-white/40 py-20 backdrop-blur-[50px]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {t('home.browse.headline')}
          </h2>
          <Link
            href={ROUTES.SERVICES}
            className="flex items-center gap-1 text-lg font-semibold text-brand-navy transition-colors duration-200 motion-safe:hover:underline"
          >
            {t('home.browse.browseCta')}
            <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
          {cards.map((card) => (
            <ServiceCard
              key={card.key}
              title={card.title}
              body={card.body}
              viewMoreLabel={viewMore}
              href={ROUTES.SERVICES}
              Icon={card.Icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
