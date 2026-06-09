'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useProject } from '../api/get-project';
import { isApprovedPhase, statusVariant } from '../lib/project-status';

import { ApprovedProjectDetail } from './approved-project-detail';
import { CompletedProjectDetail } from './completed-project-detail';
import { InProgressProjectDetail } from './in-progress-project-detail';

type Props = { projectId: number };

/**
 * Route entry for /dashboard/projects/[id]. Dispatches an assigned-project detail
 * by lifecycle status: APPROVED / PHASE_PLANNING (offer accepted) renders
 * {@link ApprovedProjectDetail}, a completed project renders
 * {@link CompletedProjectDetail}, anything else (contract · in-progress) renders
 * the in-progress execution view {@link InProgressProjectDetail}. Bid/pending
 * projects never reach here — the projects table routes them to
 * /dashboard/job-offers/[id]. The `useProject` call below shares the TanStack
 * Query cache (same key) with the chosen child, so dispatching costs no extra request.
 */
export function AssignedProjectDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);

  if (isPending) return <DetailMessage>{t('dashboard.projectDetail.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.projectDetail.error')}</DetailMessage>;

  if (isApprovedPhase(project.status)) return <ApprovedProjectDetail projectId={projectId} />;
  return statusVariant(project.status) === 'completed' ? (
    <CompletedProjectDetail projectId={projectId} />
  ) : (
    <InProgressProjectDetail projectId={projectId} />
  );
}

function DetailMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-foreground/60 text-end text-sm">{children}</p>
    </div>
  );
}
