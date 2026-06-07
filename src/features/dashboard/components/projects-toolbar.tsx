'use client';

import { useTranslation } from 'react-i18next';

import { FilterIcon } from '@/components/icons';

export const PROJECT_FILTERS = [
  'all',
  'available',
  'directAssignment',
  'bidding',
  'approved',
  'contract',
  'inProgress',
  'completed',
] as const;
export type ProjectFilterKey = (typeof PROJECT_FILTERS)[number];

const TAB_BASE =
  'shrink-0 rounded-full px-4 py-2.5 text-xs tracking-[0.1px] whitespace-nowrap transition-colors';
const TAB_ACTIVE = `${TAB_BASE} bg-toggle-highlight text-foreground font-semibold`;
const TAB_INACTIVE = `${TAB_BASE} text-toggle-inactive font-medium motion-safe:hover:text-foreground`;

type Props = {
  active: ProjectFilterKey;
  onSelect: (key: ProjectFilterKey) => void;
};

/**
 * Projects-table toolbar (Figma 1046:7124): a left filter pill + a pill-style
 * segmented control of status filters on the right. The segment row uses
 * `flex-row-reverse` so the default "All" segment sits at the reading-start edge
 * (right in `ar`, left in `en`) matching the RTL-first Figma, and the whole row
 * mirrors when the locale toggles. Controlled — the active filter lives in the
 * parent view so the table can read it. The filter pill is presentational for
 * now (no filter sheet in scope).
 */
export function ProjectsToolbar({ active, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        className="border-filter-border text-foreground/60 inline-flex shrink-0 items-center gap-2.5 self-end rounded-full border px-6 py-2.5 text-base font-medium motion-safe:transition-colors sm:self-auto"
      >
        {t('dashboard.projects.filter')}
        <FilterIcon className="size-4 shrink-0" aria-hidden />
      </button>
      <div
        role="tablist"
        aria-label={t('dashboard.projects.title')}
        className="bg-toggle-pill flex min-w-0 [scrollbar-width:none] flex-row-reverse gap-1 overflow-x-auto rounded-full p-1 [&::-webkit-scrollbar]:hidden"
      >
        {PROJECT_FILTERS.map((key) => {
          const selected = active === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(key)}
              className={selected ? TAB_ACTIVE : TAB_INACTIVE}
            >
              {t(`dashboard.projects.toggle.${key}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
