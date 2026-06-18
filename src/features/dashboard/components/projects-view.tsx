'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useTechnicianProjects } from '../api';
import { matchesFilter } from '../lib/project-status';
import type { Project } from '../schemas/project';

import { ProjectsTable } from './projects-table';
import { ProjectsToolbar, type ProjectFilterKey } from './projects-toolbar';

type Props = {
  /** Server-rendered zero-state, shown when the technician has no assigned projects. */
  emptyState: ReactNode;
};

/**
 * Interactive shell for the SP Projects screen — owns the active status filter,
 * fetches the technician's full project list via {@link useTechnicianProjects}
 * (PROJECTS.MY_ASSIGNED for assigned work — approved / contract / in-progress /
 * completed / direct-assigned — MERGED with BIDS.MY_BIDS for bid-phase work, since
 * `/projects/my-assigned` lists a project only once a bid is accepted) and renders
 * the toolbar + the matching state (loading / error / empty / filtered table). The
 * open-market biddable pool is surfaced separately on the dashboard home; this tab
 * is the technician's own work. The toolbar narrows by phase; the fetch keeps all
 * rows. Kept a thin `'use client'` island so the page stays an RSC.
 */
export function ProjectsView({ emptyState }: Props) {
  const [filter, setFilter] = useState<ProjectFilterKey>('all');
  const { data, isPending, isError } = useTechnicianProjects();
  const total = data?.length ?? 0;
  const filtered = useMemo(
    () => (data ?? []).filter((p) => matchesFilter(p, filter)),
    [data, filter],
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ProjectsToolbar active={filter} onSelect={setFilter} />
      <ProjectsBody
        isPending={isPending}
        isError={isError}
        total={total}
        filtered={filtered}
        emptyState={emptyState}
      />
    </div>
  );
}

type BodyProps = {
  isPending: boolean;
  isError: boolean;
  total: number;
  filtered: Project[];
  emptyState: ReactNode;
};

function ProjectsBody({ isPending, isError, total, filtered, emptyState }: BodyProps) {
  const { t } = useTranslation();

  if (isPending) return <TableSkeleton />;
  if (isError) return <Centered text={t('dashboard.projects.table.error')} />;
  if (total === 0) {
    return <div className="flex flex-1 items-center justify-center py-12">{emptyState}</div>;
  }
  if (filtered.length === 0) return <Centered text={t('dashboard.projects.table.filterEmpty')} />;

  return <ProjectsTable projects={filtered} />;
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
