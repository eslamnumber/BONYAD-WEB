'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMyProjects } from '../api';
import {
  computeCustomerStats,
  matchesCustomerFilter,
  sortProjects,
  type CustomerFilterKey,
  type CustomerSortKey,
} from '../lib/project-customer';
import type { MyProject } from '../schemas/project';

import { CustomerProjectStatCards } from './customer-project-stat-cards';
import { CustomerProjectsTable } from './customer-projects-table';
import { CustomerProjectsToolbar } from './customer-projects-toolbar';

/**
 * Interactive shell for the customer Projects screen (Figma 1394:8107). A single
 * fetch (`/projects/my`) feeds both the KPI stat cards and the table; the toolbar
 * narrows by status and the sort menu orders by price/date — all client-side, so
 * the fetch keeps every row. Kept a thin `'use client'` island so the page RSC
 * stays server-rendered and just role-branches into it.
 */
export function CustomerProjectsView() {
  const { data, isPending, isError } = useMyProjects();
  const [filter, setFilter] = useState<CustomerFilterKey>('all');
  const [sort, setSort] = useState<CustomerSortKey>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  const projects = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => computeCustomerStats(projects), [projects]);
  const visible = useMemo(
    () =>
      sortProjects(
        projects.filter((proj) => matchesCustomerFilter(proj, filter)),
        sort,
      ),
    [projects, filter, sort],
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <CustomerProjectStatCards stats={stats} />
      <div className="flex flex-col gap-6">
        <CustomerProjectsToolbar
          filter={filter}
          onFilter={setFilter}
          sort={sort}
          onSort={(key) => {
            setSort(key);
            setSortOpen(false);
          }}
          sortOpen={sortOpen}
          onToggleSort={() => setSortOpen((open) => !open)}
        />
        <CustomerProjectsBody
          isPending={isPending}
          isError={isError}
          total={projects.length}
          visible={visible}
        />
      </div>
    </div>
  );
}

type BodyProps = {
  isPending: boolean;
  isError: boolean;
  total: number;
  visible: MyProject[];
};

function CustomerProjectsBody({ isPending, isError, total, visible }: BodyProps) {
  const { t } = useTranslation();

  if (isPending) return <TableSkeleton />;
  if (isError) return <Centered text={t('dashboard.projects.table.error')} />;
  if (total === 0) return <CustomerEmpty />;
  if (visible.length === 0) return <Centered text={t('dashboard.projects.table.filterEmpty')} />;
  return <CustomerProjectsTable projects={visible} />;
}

function CustomerEmpty() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col items-center gap-2 py-12 text-center">
      <p dir="auto" className="text-foreground text-lg font-medium">
        {t('dashboard.projects.customer.empty.title')}
      </p>
      <p dir="auto" className="text-foreground/60 max-w-[420px] text-sm">
        {t('dashboard.projects.customer.empty.description')}
      </p>
    </div>
  );
}

function Centered({ text }: { text: string }) {
  return (
    <p dir="auto" className="text-foreground/60 w-full py-12 text-center text-sm">
      {text}
    </p>
  );
}

function TableSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-lg border" aria-hidden>
      <div className="bg-table-head-bg h-10" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="border-border flex h-16 items-center border-b px-4 last:border-b-0">
          <div className="bg-muted h-4 w-full animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
