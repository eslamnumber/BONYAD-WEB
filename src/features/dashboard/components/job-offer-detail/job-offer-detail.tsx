'use client';

import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useProject } from '../../api/get-project';
import { partitionProjectFiles } from '../../lib/project-files';
import { isPendingOrBidPhase } from '../../lib/project-status';

import { AttachmentsCard } from './attachments-card';
import { CustomerOfferStatus } from './customer-offer-status';
import { JobOfferBreadcrumb } from './job-offer-breadcrumb';
import { JobOfferStatus } from './job-offer-status';
import { OfferPanel } from './offer-panel';
import { ProjectDescriptionCard } from './project-description-card';
import { ProjectImagesCard } from './project-images-card';
import { ProjectPhasesCard } from './project-phases-card';
import { ProjectSowColumn } from './project-sow-column';
import { ProjectSummaryCard } from './project-summary-card';

type Props = { projectId: number };

/**
 * Project / job-offer detail screen body (Figma "Dashboard-SP (Project Detail)",
 * node 1046:6923 — the Page column only; the right sidebar is supplied by the
 * (app) layout). Client component: fetches the project via TanStack Query (the
 * proxy attaches the session token) and lays out the breadcrumb + summary card +
 * a two-column row (submit-offer form · attachments / description · phases ·
 * images). `project.files` is split by type — image files feed the images gallery,
 * documents the attachments card. Sections are filled one Phase-5 sub-phase at a time.
 */
export function JobOfferDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);
  // Service providers see the submit-offer panel; the project owner (customer)
  // sees the awaiting-offers card + Edit/Delete (RN `isTechnician` gate).
  const isTechnician = (useAuthStore((s) => s.user?.role) ?? '').toUpperCase() === 'TECHNICIAN';

  if (isPending) return <JobOfferStatus>{t('dashboard.jobOffer.loading')}</JobOfferStatus>;
  if (isError || !project) return <JobOfferStatus>{t('dashboard.jobOffer.error')}</JobOfferStatus>;
  if (!isPendingOrBidPhase(project.status))
    return <JobOfferStatus>{t('dashboard.jobOffer.notBidPhase')}</JobOfferStatus>;

  const { images, documents } = partitionProjectFiles(project.files);

  return (
    <div className="relative overflow-x-clip">
      {/* Figma "Ellipse 27" (1103:6217): a soft violet glow anchored to the very top
          of the page (brightest at the top edge, fading down). Absolute, so it
          scrolls away with the page; height capped above the cards so it stays a top band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-[280px] w-full max-w-[1085px] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-deco-blob-purple),transparent_70%)] opacity-50 blur-[24px] sm:block"
      />
      <div className="relative z-10 flex w-full flex-col gap-6 px-4 py-8 sm:px-6">
        <JobOfferBreadcrumb />
        <ProjectSummaryCard project={project} showStatusBadge={!isTechnician} />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
            {isTechnician ? (
              <>
                <OfferPanel projectId={projectId} />
                <AttachmentsCard project={project} files={documents} />
              </>
            ) : (
              <CustomerOfferStatus projectId={projectId} />
            )}
          </div>
          <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
            <ProjectDescriptionCard project={project} />
            <ProjectPhasesCard projectId={projectId} />
            {/* AI Scope-of-Work above the images: objectives + scope. Self-hides for manual. */}
            <ProjectSowColumn project={project} group="above" />
            <ProjectImagesCard images={images} />
            {/* AI Scope-of-Work below the images: deliverables, resources, compliance, risks, KPIs. */}
            <ProjectSowColumn project={project} group="below" />
          </div>
        </div>
      </div>
    </div>
  );
}
