'use client';

import { useTranslation } from 'react-i18next';

import { FilterIcon } from '@/components/icons';

import { CUSTOMER_FILTERS, type CustomerFilterKey } from '../lib/project-customer';
import { type ProjectSortKey } from '../lib/project-sort';

import { ProjectsSortMenu } from './projects-sort-menu';

const TAB_BASE =
  'shrink-0 rounded-full px-4 py-2.5 text-xs tracking-[0.1px] whitespace-nowrap transition-colors';
const TAB_ACTIVE = `${TAB_BASE} bg-toggle-highlight text-foreground font-semibold`;
const TAB_INACTIVE = `${TAB_BASE} text-toggle-inactive font-medium motion-safe:hover:text-foreground`;

type Props = {
  filter: CustomerFilterKey;
  onFilter: (key: CustomerFilterKey) => void;
  sort: ProjectSortKey;
  onSort: (key: ProjectSortKey) => void;
  sortOpen: boolean;
  onToggleSort: () => void;
};

/**
 * Customer Projects toolbar (Figma 1394:8119): the left "Filter" pill opens the
 * price/date sort menu (the design's only sort affordance — it floats directly
 * under this pill), and the right segmented control filters by status. The
 * segment row uses `flex-row-reverse` so "All" sits at the reading-start edge and
 * mirrors with the locale. Controlled — filter + sort state live in the parent.
 */
export function CustomerProjectsToolbar({
  filter,
  onFilter,
  sort,
  onSort,
  sortOpen,
  onToggleSort,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative self-end sm:self-auto">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={sortOpen}
          onClick={onToggleSort}
          className="border-filter-border text-foreground/60 inline-flex shrink-0 items-center gap-2.5 rounded-full border px-6 py-2.5 text-base font-medium motion-safe:transition-colors"
        >
          {t('dashboard.projects.filter')}
          <FilterIcon className="size-4 shrink-0" aria-hidden />
        </button>
        {sortOpen ? <ProjectsSortMenu value={sort} onSelect={onSort} /> : null}
      </div>
      <div
        role="tablist"
        aria-label={t('dashboard.projects.title')}
        className="bg-toggle-pill flex min-w-0 [scrollbar-width:none] flex-row-reverse gap-1 overflow-x-auto rounded-full p-1 [&::-webkit-scrollbar]:hidden"
      >
        {CUSTOMER_FILTERS.map((key) => {
          const selected = filter === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onFilter(key)}
              className={selected ? TAB_ACTIVE : TAB_INACTIVE}
            >
              {t(`dashboard.projects.customer.toggle.${key}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
