'use client';

import { useTranslation } from 'react-i18next';

import { useProject } from '../../api/get-project';
import { isPendingOrBidPhase } from '../../lib/project-status';

import { AttachmentsCard } from './attachments-card';
import { JobOfferBreadcrumb } from './job-offer-breadcrumb';
import { JobOfferStatus } from './job-offer-status';
import { ProjectDescriptionCard } from './project-description-card';
import { ProjectPhasesCard } from './project-phases-card';
import { ProjectSummaryCard } from './project-summary-card';
import { SubmitOfferForm } from './submit-offer-form';

type Props = { projectId: number };

/**
 * Project / job-offer detail screen body (Figma "Dashboard-SP (Project Detail)",
 * node 1046:6923 — the Page column only; the right sidebar is supplied by the
 * (app) layout). Client component: fetches the project via TanStack Query (the
 * proxy attaches the session token) and lays out the breadcrumb + summary card +
 * a two-column row (submit-offer form / description · phases · attachments).
 * Sections are filled one Phase-5 sub-phase at a time.
 */
export function JobOfferDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);

  if (isPending) return <JobOfferStatus>{t('dashboard.jobOffer.loading')}</JobOfferStatus>;
  if (isError || !project) return <JobOfferStatus>{t('dashboard.jobOffer.error')}</JobOfferStatus>;
  if (!isPendingOrBidPhase(project.status))
    return <JobOfferStatus>{t('dashboard.jobOffer.notBidPhase')}</JobOfferStatus>;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <JobOfferBreadcrumb />
      <ProjectSummaryCard project={project} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full lg:w-[400px] lg:shrink-0">
          <SubmitOfferForm projectId={projectId} />
        </div>
        <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
          <ProjectDescriptionCard project={project} />
          <ProjectPhasesCard projectId={projectId} />
          <AttachmentsCard project={project} />
        </div>
      </div>
    </div>
  );
}
