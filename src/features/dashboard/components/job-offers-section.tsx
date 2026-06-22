'use client';

import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { JobOfferList } from './job-offer-list';
import { JobOfferTabs, type JobTabKey } from './job-offer-tabs';
import { SupervisionList } from './supervision/supervision-list';

const PANEL_ID = 'job-offers-panel';

/**
 * "اكتشف المشاريع" section — heading + a "View on map" entry into the projects
 * map + sort tabs over the job-offer list. Owns the active-tab state; the list
 * (Phase 5f) reads it to sort/filter. The navy active underline sits on the
 * full-width divider, matching the Figma separator.
 */
export function JobOffersSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState<JobTabKey>('bestForYou');

  return (
    <section className="flex w-full flex-col items-end gap-8">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Heading anchors to the inline-end to match the section's items-end content
            (tabs + list); the map link sits at the inline-start via order-first while
            the <h2> stays first in the DOM for the document outline. No dir="auto" —
            it's a static label with no weak punctuation (would mis-side it under the
            inverted en→rtl map). */}
        <h2 className="text-foreground min-w-0 text-end text-2xl font-semibold sm:text-[32px]">
          {t('dashboard.pageTitle')}
        </h2>
        <Link
          href={ROUTES.DASHBOARD_PROJECTS_MAP}
          className="text-brand-dark-navy border-border hover:bg-nav-hover focus-visible:outline-ring order-first inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <MapPin className="size-4 shrink-0" aria-hidden />
          {t('dashboard.viewOnMap')}
        </Link>
      </div>
      <div className="flex w-full flex-col items-end">
        <JobOfferTabs active={active} onSelect={setActive} panelId={PANEL_ID} />
        <div className="bg-job-divider h-px w-full" />
      </div>
      {active === 'supervision' ? (
        <div id={PANEL_ID} role="tabpanel" aria-labelledby="job-tab-supervision" className="w-full">
          <SupervisionList status="invited" />
        </div>
      ) : (
        <JobOfferList activeTab={active} panelId={PANEL_ID} />
      )}
    </section>
  );
}
