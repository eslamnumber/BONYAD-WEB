'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

/**
 * Breadcrumb for the project-detail screen (Figma node 1046:6925): the current
 * page ("Project details", navy) ‹ a link back to the job-offers list ("Job
 * offers", muted). DOM order is current → chevron → parent so it matches the
 * Figma layout in ar (dir=ltr) and mirrors in en (dir=rtl). The chevron is a
 * forward chevron (arrowhead points in the reading direction); the exact Figma
 * export points left, so it flips in en via `rtl:-scale-x-100`.
 */
export function JobOfferBreadcrumb() {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('dashboard.jobOffer.breadcrumbAria')}
      className="flex w-full items-center justify-end gap-2 text-sm"
    >
      <span className="text-brand-dark-navy font-semibold" dir="auto" aria-current="page">
        {t('dashboard.jobOffer.title')}
      </span>
      <ChevronLeftIcon
        className="text-foreground/60 size-3 shrink-0 rtl:-scale-x-100"
        aria-hidden
      />
      <Link
        href={ROUTES.DASHBOARD}
        dir="auto"
        className="text-foreground/60 focus-visible:outline-ring motion-safe:hover:text-foreground rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.nav.jobOffers')}
      </Link>
    </nav>
  );
}
