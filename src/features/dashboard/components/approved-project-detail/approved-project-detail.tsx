'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useProject } from '../../api/get-project';
import { partitionProjectFiles } from '../../lib/project-files';
import { AttachmentsCard } from '../job-offer-detail/attachments-card';
import { ProjectDescriptionCard } from '../job-offer-detail/project-description-card';
import { ProjectImagesCard } from '../job-offer-detail/project-images-card';
import { ProjectPhasesCard } from '../job-offer-detail/project-phases-card';

import { ApprovedProjectSummaryCard } from './approved-project-summary-card';
import { OfferAcceptedCard } from './offer-accepted-card';

type Props = { projectId: number };

/**
 * Approved / phase-planning view of an assigned project — the technician's screen
 * once the customer accepts their bid (Figma "Dashboard-SP (Project detail) -
 * Offer Accepted", node 1103:6414 — the Page column only; the right sidebar is
 * supplied by the (app) layout). Sibling of {@link InProgressProjectDetail} and
 * {@link CompletedProjectDetail}; the /dashboard/projects/[id] route dispatches to
 * one of the three by lifecycle status (see {@link AssignedProjectDetail}). The UI
 * has no separate "phase planning" state — APPROVED and PHASE_PLANNING both land
 * here (see `isApprovedPhase`). Client component: fetches the project via TanStack
 * Query (the proxy attaches the session token). Sections are filled one Phase-5
 * sub-phase at a time.
 */
export function ApprovedProjectDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);

  if (isPending) return <DetailMessage>{t('dashboard.projectDetail.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.projectDetail.error')}</DetailMessage>;

  const { images, documents } = partitionProjectFiles(project.files);

  return (
    <div className="relative isolate w-full px-4 py-8 sm:px-6">
      <TopGlow />
      <div className="flex flex-col gap-6">
        <BackLink />
        <ApprovedProjectSummaryCard project={project} />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
            <OfferAcceptedCard project={project} />
            <AttachmentsCard project={project} files={documents} />
          </div>
          <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
            <ProjectDescriptionCard project={project} />
            <ProjectPhasesCard projectId={projectId} />
            <ProjectImagesCard images={images} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative top glow — a soft radial gradient anchored to the top edge (brightest
 * at the top, fading down) in the approved status colour (green), styled like the
 * job-offer detail screen's top glow. Token-driven + dark-adaptive via
 * --color-status-approved; pointer-events-none and aria-hidden, shown from `sm:` up.
 */
function TopGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-[280px] w-full max-w-[1085px] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-status-approved),transparent_70%)] opacity-50 blur-[24px] sm:block"
    />
  );
}

/**
 * Back link to the projects list (Figma 1103:6535): label + chevron, packed to the
 * inline-end. The single ChevronLeft export flipped via `ltr:-scale-x-100` (fires in
 * Arabic under the inverted en→rtl / ar→ltr mapping) so the back arrow points toward
 * the return edge in both locales — a back arrow, not a forward separator.
 */
function BackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex w-full items-center justify-end">
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('dashboard.approvedProject.back')}
        <ChevronLeftIcon className="size-3 shrink-0 ltr:-scale-x-100" aria-hidden />
      </Link>
    </nav>
  );
}

function DetailMessage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-4 py-8 sm:px-6">
      <p className="text-foreground/60 text-end text-sm">{children}</p>
    </div>
  );
}
