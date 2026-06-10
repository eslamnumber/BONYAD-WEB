'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useProject } from '../../api/get-project';
import { useProjectPhases } from '../../api/get-project-phases';
import { partitionProjectFiles } from '../../lib/project-files';
import { AttachmentsCard } from '../job-offer-detail/attachments-card';
import { ProjectImagesCard } from '../job-offer-detail/project-images-card';

import { BudgetSummaryCard } from './budget-summary-card';
import { PaymentStatusCard } from './payment-status-card';
import { ProjectHeaderCard } from './project-header-card';
import { ProjectPhasesTimeline } from './project-phases-timeline';
import { ProjectProgressCard } from './project-progress-card';

type Props = { projectId: number };

/**
 * In-progress (execution) view of an assigned project — Figma "Dashboard-SP
 * (Project detail) - Offer Accepted", node 1103:6593 (the Page column only; the
 * right sidebar is supplied by the (app) layout). Sibling of
 * {@link CompletedProjectDetail}; the /dashboard/projects/[id] route dispatches to
 * one or the other by lifecycle status (see {@link AssignedProjectDetail}).
 * Client component: fetches the project via TanStack Query (the proxy attaches the
 * session token). Sections are filled one Phase-5 sub-phase at a time:
 * 5a back-link · 5b header · 5c summary · 5d payments · 5e progress · 5f phases.
 */
export function InProgressProjectDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);
  const { data: phases = [], isPending: phasesPending } = useProjectPhases(projectId);

  if (isPending) return <DetailMessage>{t('dashboard.projectDetail.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.projectDetail.error')}</DetailMessage>;

  const { images, documents } = partitionProjectFiles(project.files);

  return (
    <div className="relative isolate mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <TopGlow />
      <div className="flex flex-col gap-6">
        <BackLink />
        <ProjectHeaderCard project={project} />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
            <BudgetSummaryCard project={project} phases={phases} pending={phasesPending} />
            <PaymentStatusCard phases={phases} pending={phasesPending} />
            <AttachmentsCard project={project} files={documents} />
          </div>
          <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
            <ProjectProgressCard phases={phases} />
            <ProjectPhasesTimeline phases={phases} pending={phasesPending} />
            <ProjectImagesCard images={images} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative top glow — a soft violet radial gradient anchored to the top edge
 * (brightest at the top, fading down), matching the job-offer detail screen
 * (JobOfferDetail). Token-driven + dark-adaptive via --color-deco-blob-purple;
 * pointer-events-none and aria-hidden, shown from `sm:` up.
 */
function TopGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-[280px] w-full max-w-[1085px] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-deco-blob-purple),transparent_70%)] opacity-50 blur-[24px] sm:block"
    />
  );
}

/**
 * Back link to the projects list (Figma 1103:6699): label + chevron packed to the
 * inline-end. The single ChevronLeft export flipped via `ltr:-scale-x-100` — which
 * fires in Arabic under the inverted en→rtl / ar→ltr mapping — so the back arrow
 * points toward the return edge in both locales (a back arrow, not a forward
 * separator like the breadcrumb chevron).
 */
function BackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex w-full items-center justify-end">
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('dashboard.projectDetail.back')}
        <ChevronLeftIcon className="size-3 shrink-0 ltr:-scale-x-100" aria-hidden />
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
