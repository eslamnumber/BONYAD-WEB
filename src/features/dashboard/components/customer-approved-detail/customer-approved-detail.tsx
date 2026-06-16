'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useProject } from '../../api/get-project';
import { useProjectPhases } from '../../api/get-project-phases';
import { ContractPhasesCard } from '../contract-signing-project-detail/contract-phases-card';
import { ContractProviderCard } from '../contract-signing-project-detail/contract-provider-card';
import { ContractSummaryCard } from '../contract-signing-project-detail/contract-summary-card';
import { ProjectProgressCard } from '../in-progress-project-detail/project-progress-card';

import { SigningMethodCard } from './signing-method-card';

type Props = { projectId: number };

/**
 * Customer's APPROVED / PHASE_PLANNING view of a project (Figma "Dashboard-Singing
 * Contract", node 1431:10098) — the review-&-approve step before the contract is
 * sent. Summary header + the selected-provider card and signing-method picker on the
 * left, progress + phases on the right. Routed from {@link AssignedProjectDetail}
 * only for the customer; once they approve the phases the project moves to
 * CONTRACT_SIGNING and re-routes to {@link ContractSigningProjectDetail}. Client
 * component; data via TanStack Query (the proxy attaches the session token).
 */
export function CustomerApprovedDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);
  const { data: phases } = useProjectPhases(projectId);

  if (isPending) return <DetailMessage>{t('dashboard.projectDetail.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.projectDetail.error')}</DetailMessage>;

  return (
    <div className="relative isolate mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <TopGlow />
      <div className="flex flex-col gap-6">
        <BackLink />
        <ContractSummaryCard project={project} variant="approved" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
            <ContractProviderCard project={project} />
            <SigningMethodCard project={project} phases={phases ?? []} />
          </div>
          <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
            <ProjectProgressCard phases={phases ?? []} />
            <ContractPhasesCard projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative top glow in the approved status colour (green) — token-driven +
 * dark-adaptive via --color-status-approved, mirroring the technician approved
 * screen. pointer-events-none + aria-hidden, shown from `sm:` up.
 */
function TopGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-[280px] w-full max-w-[1085px] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-status-approved),transparent_70%)] opacity-50 blur-[24px] sm:block"
    />
  );
}

/** Back link to the projects list — chevron flips via `ltr:-scale-x-100` (a back
 *  arrow, not a forward separator; fires in Arabic under the inverted mapping). */
function BackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex w-full items-center justify-end">
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('dashboard.customerApproved.back')}
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
