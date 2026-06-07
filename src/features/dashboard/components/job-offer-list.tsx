'use client';

import { useTranslation } from 'react-i18next';

import { useAvailableProjects } from '../api';
import type { Project } from '../schemas/project';

import { JobOfferItem } from './job-offer-item';
import type { JobTabKey } from './job-offer-tabs';

/** Apply the active tab's sort/filter. "Saved" has no endpoint yet → empty state. */
function sortForTab(projects: Project[], tab: JobTabKey): Project[] {
  if (tab === 'saved') return [];
  if (tab === 'newest') {
    return [...projects].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }
  return projects;
}

type JobOfferListProps = { activeTab: JobTabKey; panelId: string };

export function JobOfferList({ activeTab, panelId }: JobOfferListProps) {
  const { t } = useTranslation();
  const { data, isPending, isError } = useAvailableProjects();
  const projects = sortForTab(data ?? [], activeTab);
  const emptyText =
    activeTab === 'saved' ? t('dashboard.offer.savedEmpty') : t('dashboard.offer.empty');

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={`job-tab-${activeTab}`} className="w-full">
      <ListBody isPending={isPending} isError={isError} projects={projects} emptyText={emptyText} />
    </div>
  );
}

type ListBodyProps = {
  isPending: boolean;
  isError: boolean;
  projects: Project[];
  emptyText: string;
};

function ListBody({ isPending, isError, projects, emptyText }: ListBodyProps) {
  const { t } = useTranslation();

  if (isPending) return <ListSkeleton />;
  if (isError) return <ListMessage text={t('dashboard.offer.error')} />;
  if (projects.length === 0) return <ListMessage text={emptyText} />;

  return (
    <ul className="flex w-full flex-col">
      {projects.map((project) => (
        <li key={project.id}>
          <JobOfferItem project={project} />
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="flex w-full flex-col" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-job-divider border-b px-6 py-8">
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function ListMessage({ text }: { text: string }) {
  return (
    <p dir="auto" className="text-foreground/60 py-12 text-center text-base">
      {text}
    </p>
  );
}
