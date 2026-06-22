'use client';

import { useTranslation } from 'react-i18next';

export const JOB_TABS = ['saved', 'newest', 'bestForYou', 'supervision'] as const;
export type JobTabKey = (typeof JOB_TABS)[number];

const BASE = 'border-b-2 pb-2 text-base font-medium whitespace-nowrap transition-colors';
const ACTIVE = `${BASE} text-brand-dark-navy border-brand-dark-navy`;
const INACTIVE = `${BASE} text-foreground/60 motion-safe:hover:text-foreground border-transparent`;

type JobOfferTabsProps = {
  active: JobTabKey;
  onSelect: (key: JobTabKey) => void;
  panelId: string;
};

/** Sort/filter tabs for the job-offer list. Controlled — state lives in the section. */
export function JobOfferTabs({ active, onSelect, panelId }: JobOfferTabsProps) {
  const { t } = useTranslation();

  return (
    <div role="tablist" className="flex flex-wrap items-center gap-x-8 gap-y-2">
      {JOB_TABS.map((key) => {
        const selected = active === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            id={`job-tab-${key}`}
            aria-selected={selected}
            aria-controls={panelId}
            onClick={() => onSelect(key)}
            className={selected ? ACTIVE : INACTIVE}
          >
            {t(`dashboard.tabs.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
