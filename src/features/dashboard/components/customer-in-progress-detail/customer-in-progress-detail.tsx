'use client';

import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useProject } from '../../api/get-project';
import { useProjectPhases } from '../../api/get-project-phases';
import { partitionProjectFiles } from '../../lib/project-files';
import { type ProjectPhase } from '../../schemas/project-phase';
import { ContractProviderCard } from '../contract-signing-project-detail/contract-provider-card';
import { PaymentStatusCard } from '../in-progress-project-detail/payment-status-card';
import { ProjectHeaderCard } from '../in-progress-project-detail/project-header-card';
import { ProjectProgressCard } from '../in-progress-project-detail/project-progress-card';
import { AttachmentsCard } from '../job-offer-detail/attachments-card';
import { ProjectImagesCard } from '../job-offer-detail/project-images-card';

import { CustomerPhasesCard } from './customer-phases-card';
import { PhasePaymentFlow } from './payment-flow';
import { PhasePaymentResultModal } from './phase-payment-result-modal';
import { usePhasePaymentResult } from './use-phase-payment-result';

type Props = { projectId: number };

/**
 * Customer's IN_PROGRESS (execution) view — Figma "Dashboard-Phase Approval
 * Require" (node 1547:1533) and its payment-flow states (1547:7351 choose payment ·
 * 1553:7685 review & confirm · 1553:8142 payment confirmed). The customer approves
 * each phase the technician submitted and pays it (full phase or partial) via
 * HyperPay. Sibling of the technician's {@link InProgressProjectDetail}; the
 * /dashboard/projects/[id] router dispatches customer + IN_PROGRESS here (see
 * {@link AssignedProjectDetail}). Client component — fetches the project + phases
 * via TanStack Query (the proxy attaches the session token).
 *
 * Phase-5 build order (sections filled one sub-phase at a time):
 * 5b ProviderCard ✓ (reuses {@link ContractProviderCard} — same Figma provider
 * card) · 5c customer phase timeline ✓ ({@link CustomerPhasesCard} — Approve →
 * payment, Request-changes placeholder) · 5d payment flow ({@link PhasePaymentFlow}:
 * options modal → review → checkout redirect → success).
 */
export function CustomerInProgressDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);
  const { data: phases = [], isPending: phasesPending } = useProjectPhases(projectId);
  // The phase the customer is paying — set by a row's Approve button, opens the
  // payment flow (5d). null = no flow open.
  const [payingPhase, setPayingPhase] = useState<ProjectPhase | null>(null);
  // The HyperPay redirect returns here (5d.4) → result shown as a modal in place.
  const paymentResult = usePhasePaymentResult(projectId);

  if (isPending) return <DetailMessage>{t('dashboard.projectDetail.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.projectDetail.error')}</DetailMessage>;

  const { images, documents } = partitionProjectFiles(project.files);

  return (
    <div className="relative isolate w-full px-4 py-8 sm:px-6">
      <TopGlow />
      <div className="flex flex-col gap-6">
        <BackLink />
        <ProjectHeaderCard project={project} />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
            <ContractProviderCard project={project} />
            {/* Approve on a phase opens the choose-payment → review flow inline here,
                above the payments-status card (Figma 1547:7351 / 1553:7685). */}
            <PhasePaymentFlow
              key={payingPhase?.id ?? 'closed'}
              phase={payingPhase}
              phases={phases}
              projectId={projectId}
              onClose={() => setPayingPhase(null)}
            />
            <PaymentStatusCard phases={phases} pending={phasesPending} />
            <AttachmentsCard project={project} files={documents} />
          </div>
          <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
            <ProjectProgressCard phases={phases} />
            <CustomerPhasesCard
              phases={phases}
              pending={phasesPending}
              onApprovePhase={setPayingPhase}
            />
            <ProjectImagesCard images={images} />
          </div>
        </div>
      </div>
      <PhasePaymentResultModal {...paymentResult} />
    </div>
  );
}

/**
 * Decorative top glow — soft radial gradient in the in-progress status colour
 * (amber), matching {@link InProgressProjectDetail}. Token-driven + dark-adaptive
 * via --color-status-progress; pointer-events-none + aria-hidden, shown from sm: up.
 */
function TopGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-[280px] w-full max-w-[1085px] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-status-progress),transparent_70%)] opacity-50 blur-[24px] sm:block"
    />
  );
}

/** Back link to the projects list — chevron flipped via `ltr:-scale-x-100` so it
 *  points to the return edge in both locales (a back arrow, not a forward separator). */
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
    <div className="w-full px-4 py-8 sm:px-6">
      <p className="text-foreground/60 text-end text-sm">{children}</p>
    </div>
  );
}
