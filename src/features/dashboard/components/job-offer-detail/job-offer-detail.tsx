'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useProject } from '../../api/get-project';
import { partitionProjectFiles } from '../../lib/project-files';
import { isPendingOrBidPhase } from '../../lib/project-status';
import { type ProjectDetail } from '../../schemas/project';
import { CustomerSupervisorPanel } from '../supervision/customer-supervisor-panel';

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
  // Opened via a supervision invitation's "View details" (`?supervisor=1`): the SP is
  // previewing the project as its supervisor, not bidding — so suppress the offer panel.
  const supervisorPreview = useSearchParams().get('supervisor') === '1';

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
          <OfferSideColumn
            project={project}
            projectId={projectId}
            documents={documents}
            isTechnician={isTechnician}
            supervisorPreview={supervisorPreview}
          />
          <ProjectContentColumn
            project={project}
            projectId={projectId}
            images={images}
            isTechnician={isTechnician}
          />
        </div>
      </div>
    </div>
  );
}

type ColumnProps = {
  project: ProjectDetail;
  projectId: number;
  isTechnician: boolean;
};

/**
 * Left column. The technician (SP) view stacks the AI Scope-of-Work `above` group
 * (objectives + scope) under the offer panel + attachments, so the AI cards fill the
 * left column while the rest of the SOW fills the right — the two-column split. The
 * customer keeps only the awaiting-offers card here; their SOW stays in the content
 * column. Self-hides for manual projects (`ProjectSowColumn` → null).
 */
function OfferSideColumn({
  project,
  projectId,
  documents,
  isTechnician,
  supervisorPreview,
}: ColumnProps & { documents: string[]; supervisorPreview: boolean }) {
  return (
    <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
      {isTechnician ? (
        <>
          {/* Suppressed in supervisor preview — the SP manages the project, doesn't bid. */}
          {supervisorPreview ? null : <OfferPanel projectId={projectId} />}
          <AttachmentsCard project={project} files={documents} />
          <ProjectSowColumn project={project} group="above" />
        </>
      ) : (
        <>
          <CustomerSupervisorPanel projectId={projectId} />
          <CustomerOfferStatus project={project} projectId={projectId} />
        </>
      )}
    </div>
  );
}

/**
 * Right column: description · phases · images, with the AI Scope-of-Work `below`
 * group (deliverables, resources, compliance, risks, KPIs) after the images. The
 * `above` group (objectives + scope) renders here only for the customer — the
 * technician shows it in the left column instead (see {@link OfferSideColumn}).
 */
function ProjectContentColumn({
  project,
  projectId,
  images,
  isTechnician,
}: ColumnProps & { images: string[] }) {
  return (
    <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
      <ProjectDescriptionCard project={project} />
      <ProjectPhasesCard projectId={projectId} />
      {isTechnician ? null : <ProjectSowColumn project={project} group="above" />}
      <ProjectImagesCard images={images} />
      <ProjectSowColumn project={project} group="below" />
    </div>
  );
}
