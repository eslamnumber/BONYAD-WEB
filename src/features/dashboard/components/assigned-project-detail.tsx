'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useProject } from '../api/get-project';
import { isApprovedPhase, isPendingOrBidPhase, statusVariant } from '../lib/project-status';

import { ApprovedProjectDetail } from './approved-project-detail';
import { CompletedProjectDetail } from './completed-project-detail';
import { ContractSigningProjectDetail } from './contract-signing-project-detail';
import { CustomerApprovedDetail } from './customer-approved-detail';
import { CustomerInProgressDetail } from './customer-in-progress-detail';
import { InProgressProjectDetail } from './in-progress-project-detail';
import { JobOfferDetail } from './job-offer-detail';

type Props = { projectId: number };

/**
 * Route entry for /dashboard/projects/[id]. Dispatches a project detail by
 * lifecycle status AND role — each screen follows the project's real backend
 * status. A pending / bid-phase project renders {@link JobOfferDetail} (the owner
 * sees the awaiting-offers card + Edit/Delete, a technician sees the submit-offer
 * panel). The approved phase — APPROVED / PHASE_PLANNING — is role-split: the
 * **customer** gets {@link CustomerApprovedDetail} (review provider + pick a signing
 * method + approve phases), the **technician** keeps {@link ApprovedProjectDetail}
 * (their offer-accepted view). Once the customer approves the phases the project moves
 * to CONTRACT_SIGNING → the customer's {@link ContractSigningProjectDetail} (contract
 * sent to email); once execution starts (IN_PROGRESS) the customer gets
 * {@link CustomerInProgressDetail} (per-phase approval + payment), while the technician
 * falls through to the in-progress view {@link InProgressProjectDetail}. A completed project renders
 * {@link CompletedProjectDetail} for both. The customer projects table routes every
 * status here. The `useProject` call shares the TanStack Query cache (same key) with
 * the chosen child — no extra request.
 */
export function AssignedProjectDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);
  const isTechnician = (useAuthStore((s) => s.user?.role) ?? '').toUpperCase() === 'TECHNICIAN';

  if (isPending) return <DetailMessage>{t('dashboard.projectDetail.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.projectDetail.error')}</DetailMessage>;

  // The pending/bid screen (JobOfferDetail) carries its own AI Scope-of-Work columns;
  // every other lifecycle screen renders without an AI panel.
  return routeDetail(project.status, isTechnician, projectId);
}

/** Pick the detail view by lifecycle status + role (see {@link AssignedProjectDetail}). */
function routeDetail(status: string | undefined, isTechnician: boolean, projectId: number) {
  if (isPendingOrBidPhase(status)) return <JobOfferDetail projectId={projectId} />;

  const variant = statusVariant(status);
  const isApproved = isApprovedPhase(status);

  // CONTRACT_SIGNING is role-aware inside ContractSigningProjectDetail (RN's
  // `isTechnician` branch): the customer sends / resends the contract, the technician
  // views + downloads it. Both roles route here — never to the in-progress screen.
  if (variant === 'contractSigning') return <ContractSigningProjectDetail projectId={projectId} />;

  // Customer post-acceptance, one screen per backend status: APPROVED / PHASE_PLANNING
  // = the review-&-approve screen (provider + signing-method picker); once execution
  // starts (IN_PROGRESS) the customer gets their own phase-approval + per-phase payment
  // screen (CustomerInProgressDetail). Technicians fall through to their own approved /
  // in-progress views below.
  if (!isTechnician) {
    if (isApproved) return <CustomerApprovedDetail projectId={projectId} />;
    if (variant === 'inProgress') return <CustomerInProgressDetail projectId={projectId} />;
  }

  if (isApproved) return <ApprovedProjectDetail projectId={projectId} />;
  if (variant === 'completed') return <CompletedProjectDetail projectId={projectId} />;
  return <InProgressProjectDetail projectId={projectId} />;
}

function DetailMessage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-4 py-8 sm:px-6">
      <p className="text-foreground/60 text-end text-sm">{children}</p>
    </div>
  );
}
