'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useProject } from '../../api/get-project';
import { AttachmentsCard } from '../job-offer-detail/attachments-card';
import { ProjectDescriptionCard } from '../job-offer-detail/project-description-card';
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

  return (
    <div className="relative isolate mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <TopGlow />
      <div className="flex flex-col gap-6">
        <BackLink />
        <ApprovedProjectSummaryCard project={project} />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full lg:w-[400px] lg:shrink-0">
            <OfferAcceptedCard project={project} />
          </div>
          <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
            <ProjectDescriptionCard project={project} />
            <ProjectPhasesCard projectId={projectId} />
            <AttachmentsCard project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative top glow — Figma "Ellipse 27" (1103:6416): a #22C55E (approved green)
 * ellipse (1085×486) under a ~100px Gaussian blur. Reproduced as a token-driven
 * blur blob (dark-adaptive via --color-status-approved) and gated behind `xl:` per
 * responsive-design.md — its hardcoded size only applies at the Figma frame width;
 * smaller viewports omit it. `opacity-20` approximates the blur's attenuation. The
 * green (vs the completed screen's blue glow) ties the glow to the approved status.
 */
function TopGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden justify-center xl:flex"
    >
      <span className="bg-status-approved h-[486px] w-[1085px] rounded-[50%] opacity-20 blur-[100px]" />
    </div>
  );
}

/**
 * Back link to the projects list (Figma 1103:6535): label + chevron, packed to the
 * inline-end (mirrors the JobOfferBreadcrumb / CompletedProjectDetail convention).
 * The chevron is the single ChevronLeft export with the forward-flip
 * (`rtl:-scale-x-100`) so the arrowhead points along the reading direction in both
 * locales.
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
        <ChevronLeftIcon className="size-3 shrink-0 rtl:-scale-x-100" aria-hidden />
      </Link>
    </nav>
  );
}

function DetailMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-foreground/60 text-end text-sm">{children}</p>
    </div>
  );
}
