'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { JobOfferList } from './job-offer-list';
import { JobOfferTabs, type JobTabKey } from './job-offer-tabs';

const PANEL_ID = 'job-offers-panel';

/**
 * "اكتشف المشاريع" section — heading + sort tabs over the job-offer list. Owns the
 * active-tab state; the list (Phase 5f) reads it to sort/filter. The navy active
 * underline sits on the full-width divider, matching the Figma separator.
 */
export function JobOffersSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState<JobTabKey>('bestForYou');

  return (
    <section className="flex w-full flex-col items-end gap-8">
      <h2
        dir="auto"
        className="text-foreground w-full text-start text-2xl font-semibold sm:text-[32px]"
      >
        {t('dashboard.pageTitle')}
      </h2>
      <div className="flex w-full flex-col items-end">
        <JobOfferTabs active={active} onSelect={setActive} panelId={PANEL_ID} />
        <div className="bg-job-divider h-px w-full" />
      </div>
      <JobOfferList activeTab={active} panelId={PANEL_ID} />
    </section>
  );
}
