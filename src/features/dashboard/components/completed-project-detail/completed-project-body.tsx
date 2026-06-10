'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useProjectPhases } from '../../api/get-project-phases';
import { partitionProjectFiles } from '../../lib/project-files';
import { type ProjectDetail } from '../../schemas/project';
import { BudgetSummaryCard } from '../in-progress-project-detail/budget-summary-card';
import { AttachmentsCard } from '../job-offer-detail/attachments-card';
import { ProjectImagesCard } from '../job-offer-detail/project-images-card';

import { CompletedPhasesCard } from './completed-phases-card';
import { PaymentStatusCard } from './payment-status-card';
import { ProjectProgressCard } from './project-progress-card';

type Props = { project: ProjectDetail; projectId: number };

/**
 * Lower body of the completed-project detail (Figma 1103:6760): a two-column grid
 * — left (budget summary · payment status, ~400px) and right (progress · phases,
 * flexible) — that stacks on mobile and splits at `lg:`. Backend-driven from
 * `PHASES.LIST`; the budget card renders immediately (total comes from the project)
 * while phase-derived figures show "—" until the phases query settles. The
 * BudgetSummaryCard + DetailCard are shared with the in-progress detail (same Figma
 * card); they belong in a shared subfolder once both screens land.
 */
export function CompletedProjectBody({ project, projectId }: Props) {
  const { t } = useTranslation();
  const { data: phases, isPending, isError } = useProjectPhases(projectId);

  if (isError) return <BodyMessage>{t('dashboard.completedProject.error')}</BodyMessage>;

  const list = phases ?? [];
  if (!isPending && list.length === 0)
    return <BodyMessage>{t('dashboard.completedProject.empty')}</BodyMessage>;

  const { images, documents } = partitionProjectFiles(project.files);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-6 lg:w-[400px] lg:shrink-0">
        <BudgetSummaryCard project={project} phases={list} pending={isPending} />
        <PaymentStatusCard phases={list} pending={isPending} />
        <AttachmentsCard project={project} files={documents} />
      </div>
      <div className="flex w-full flex-col gap-6 lg:min-w-0 lg:flex-1">
        <ProjectProgressCard phases={list} pending={isPending} />
        <CompletedPhasesCard phases={list} pending={isPending} />
        <ProjectImagesCard images={images} />
      </div>
    </div>
  );
}

function BodyMessage({ children }: { children: ReactNode }) {
  return <p className="text-foreground/60 text-end text-sm">{children}</p>;
}
