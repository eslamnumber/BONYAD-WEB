'use client';

import { useTranslation } from 'react-i18next';

import { useAvailableProjects, useMyTechnicianServices } from '../api';
import { filterProjectsByServices } from '../lib/filter-projects-by-service';
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

/**
 * Biddable offers narrowed to the technician's own services. Combines the
 * available-projects query with the my-services query: either still loading →
 * pending; a my-services **error fails OPEN** (show all offers rather than
 * hard-block on a secondary call, mirroring RN); otherwise filter by the
 * technician's services (empty set → no offers). `isError` stays tied to the
 * projects query alone.
 */
function useScopedOffers(): { offers: Project[]; isPending: boolean; isError: boolean } {
  const projects = useAvailableProjects();
  const services = useMyTechnicianServices();
  const available = projects.data ?? [];
  const offers =
    services.isError || !services.data
      ? available
      : filterProjectsByServices(available, services.data);
  return {
    offers,
    isPending: projects.isPending || (services.isPending && !services.isError),
    isError: projects.isError,
  };
}

type JobOfferListProps = { activeTab: JobTabKey; panelId: string };

export function JobOfferList({ activeTab, panelId }: JobOfferListProps) {
  const { t } = useTranslation();
  const { offers, isPending, isError } = useScopedOffers();
  const projects = sortForTab(offers, activeTab);
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
