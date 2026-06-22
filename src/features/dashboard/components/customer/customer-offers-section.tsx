'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { useAdsFeed } from '../../api';
import { localizedServiceName } from '../../lib/project-format';
import type { Ad } from '../../schemas/ad';

/**
 * "Explore offers" (استكشف العروض) — the customer-facing technician ads feed (GET /ads/feed).
 * A responsive grid (no fixed-width carousel — rule 20): every card visible at every width.
 * Each card shows the service, the ad copy, the technician, and a Contact CTA that deep-links
 * to the messages screen with that technician pre-selected. Renders in every dashboard state
 * (discovery feed — useful even before the customer has any projects).
 */
export function CustomerOffersSection() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useAdsFeed();
  const ads = data ?? [];

  return (
    <section className="bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm">
      <h2 className="text-card-foreground w-full text-end text-lg font-semibold">
        {t('dashboard.customer.home.offers.title')}
      </h2>
      <OffersBody isPending={isPending} isError={isError} ads={ads} />
    </section>
  );
}

function OffersBody({
  isPending,
  isError,
  ads,
}: {
  isPending: boolean;
  isError: boolean;
  ads: Ad[];
}) {
  const { t } = useTranslation();
  if (isPending) return <OffersSkeleton />;
  if (isError) {
    return (
      <p className="text-card-foreground/60 w-full py-8 text-center text-sm">
        {t('dashboard.customer.home.offers.error')}
      </p>
    );
  }
  if (ads.length === 0) {
    return (
      <p className="text-card-foreground/60 w-full py-8 text-center text-sm">
        {t('dashboard.customer.home.offers.empty')}
      </p>
    );
  }
  return (
    <ul className="grid w-full snap-x snap-mandatory [scrollbar-width:none] auto-cols-[80%] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain pb-1 sm:auto-cols-[17rem] [&::-webkit-scrollbar]:hidden">
      {ads.map((ad) => (
        <OfferCard key={ad.id} ad={ad} />
      ))}
    </ul>
  );
}

function OfferCard({ ad }: { ad: Ad }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const service = localizedServiceName(
    { serviceNameEn: ad.serviceNameEn ?? undefined, serviceNameAr: ad.serviceNameAr ?? undefined },
    locale,
  );
  const tech = ad.technicianName?.trim();

  return (
    <li className="bg-card border-border hover:border-job-accent/40 flex min-h-[150px] w-full snap-start flex-col justify-between gap-3 rounded-2xl border p-4 transition-[border-color,box-shadow] hover:shadow-md">
      <div className="flex w-full flex-col items-end gap-1.5">
        {service ? (
          <span className="bg-field-surface text-job-accent inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
            <bdi>{service}</bdi>
          </span>
        ) : null}
        <p className="text-card-foreground w-full truncate text-end text-base font-medium">
          <bdi>{ad.title || t('dashboard.customer.home.offers.untitled')}</bdi>
        </p>
        {ad.body ? (
          <p className="text-card-foreground/60 line-clamp-2 w-full text-end text-sm">
            <bdi>{ad.body}</bdi>
          </p>
        ) : null}
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        {tech ? (
          <span className="text-card-foreground/60 min-w-0 truncate text-end text-xs">
            <bdi>{t('dashboard.customer.home.offers.by', { name: tech })}</bdi>
          </span>
        ) : null}
        {typeof ad.technicianId === 'number' ? (
          <Link
            href={ROUTES.DASHBOARD_MESSAGE_FOR(ad.technicianId, { name: tech })}
            className="text-job-accent order-first shrink-0 text-xs font-semibold hover:underline"
          >
            {t('dashboard.customer.home.offers.contact')}
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function OffersSkeleton() {
  return (
    <ul
      className="grid w-full auto-cols-[80%] grid-flow-col gap-4 overflow-x-hidden pb-1 sm:auto-cols-[17rem]"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <li key={i} className="bg-muted h-[150px] animate-pulse rounded-2xl" />
      ))}
    </ul>
  );
}
