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

type BrowseCard = { key: string; title: string; body: string; Icon: BrowseIconComponent };

function buildCards(t: (k: string) => string): BrowseCard[] {
  return [1, 2, 3, 4, 5].map((n) => ({
    key: String(n),
    title: t(`home.browse.card${n}Title`),
    body: t(`home.browse.card${n}Body`),
    Icon: BROWSE_ICONS[n - 1]!,
  }));
}

type ServiceCardProps = {
  title: string;
  body: string;
  viewMoreLabel: string;
  href: string;
  Icon: BrowseIconComponent;
};

function ServiceCard({ title, body, viewMoreLabel, href, Icon }: ServiceCardProps) {
  return (
    <div className="group border-border bg-card relative flex min-h-[376px] w-full flex-col overflow-hidden rounded-[4px] border p-5 shadow-[0px_10px_21px_0px_rgba(117,117,117,0.03)] backdrop-blur-[5px] transition-shadow duration-200 motion-safe:hover:shadow-md">
      <div aria-hidden className="absolute end-[17px] top-[39px]">
        <Icon className="size-[45px]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute end-[-8px] top-[244px] hidden h-[198px] w-[110px] -scale-y-100 rotate-180 sm:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/browse/card-accent-1.svg" alt="" className="block size-full" />
      </div>
      <div className="mt-[96px] flex flex-col gap-5 text-end">
        <h3 className="text-foreground text-[28px] leading-9 font-medium tracking-[0px]">
          {title}
        </h3>
        <p className="text-foreground/80 text-sm leading-5">{body}</p>
      </div>
      <Link
        href={href}
        className="text-brand-navy mt-auto inline-flex items-center gap-1 self-start text-sm font-bold transition-colors duration-200 motion-safe:hover:underline"
      >
        <ChevronRight className="size-4 ltr:-scale-x-100" aria-hidden />
        {viewMoreLabel}
      </Link>
    </div>
  );
}

export function HomeBrowse({ locale }: HomeBrowseProps) {
  const { t } = getTranslations(locale);
  const viewMore = t('home.browse.viewMore');
  const cards = buildCards(t);

  return (
    <section className="bg-card/40 py-12 backdrop-blur-[50px] sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header — 24px gap matches Figma's gap-[24px] */}
        <div className="mb-10 flex flex-col items-center gap-6 text-center sm:mb-16">
          <h2 className="text-foreground text-4xl font-medium md:text-[50px] md:tracking-[-0.25px]">
            {t('home.browse.headline')}
          </h2>
          <Link
            href={ROUTES.SERVICES}
            className="text-brand-navy inline-flex items-center gap-1 text-base font-semibold transition-colors duration-200 motion-safe:hover:underline sm:text-xl"
          >
            <ChevronRight className="size-5 ltr:-scale-x-100" aria-hidden />
            {t('home.browse.browseCta')}
          </Link>
        </div>

        <div className="-mx-4 flex flex-row gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {cards.map((card) => (
            <div
              key={card.key}
              className="w-[260px] shrink-0 sm:w-[300px] lg:w-[280px] xl:w-auto xl:min-w-[220px] xl:flex-1"
            >
              <ServiceCard
                title={card.title}
                body={card.body}
                viewMoreLabel={viewMore}
                href={ROUTES.SERVICES}
                Icon={card.Icon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
