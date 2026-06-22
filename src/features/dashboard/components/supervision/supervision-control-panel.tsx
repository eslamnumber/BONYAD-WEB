'use client';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { EyeIcon } from '@/components/icons';

import { useProject, useProjectSupervisor } from '../../api';
import type { ProjectSupervisor } from '../../schemas/supervisor';

import { SupervisionActivitySection } from './supervision-activity-section';
import { SupervisionBidsSection } from './supervision-bids-section';
import { SupervisionControlHeader } from './supervision-control-header';

function isActiveSupervisor(supervisor: ProjectSupervisor | undefined): boolean {
  if (!supervisor) return false;
  return (supervisor.status ?? '').toUpperCase() === 'ACTIVE' || supervisor.active === true;
}

/**
 * Supervisor control panel at /dashboard/supervision/[id]. The ACTIVE supervisor
 * manages the project's bids (accept/reject) and reads the audit log. Full-width
 * flush `(app)` root (rule 4a) with one signature blue glow behind content.
 */
export function SupervisionControlPanel({ projectId }: { projectId: number }) {
  const project = useProject(projectId);
  const supervisor = useProjectSupervisor(projectId);

  return (
    <div className="relative isolate flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden justify-center sm:flex"
      >
        <div className="bg-deco-blob-blue-light h-[340px] w-[340px] rounded-full opacity-20 blur-[90px]" />
      </div>
      <ControlBody project={project} supervisor={supervisor} projectId={projectId} />
    </div>
  );
}

function ControlBody({
  project,
  supervisor,
  projectId,
}: {
  project: ReturnType<typeof useProject>;
  supervisor: ReturnType<typeof useProjectSupervisor>;
  projectId: number;
}) {
  const { t } = useTranslation();

  if (project.isPending) return <LoadingState label={t('common.loading')} />;
  if (project.isError || !project.data) {
    return (
      <ErrorState
        title={t('errors.generic')}
        description={t('errors.genericDescription')}
        retryLabel={t('common.tryAgain')}
        onRetry={() => void project.refetch()}
      />
    );
  }

  const active = isActiveSupervisor(supervisor.data);

  return (
    <>
      <SupervisionControlHeader project={project.data} supervisor={supervisor.data} />
      {active ? (
        <>
          <SupervisionBidsSection projectId={projectId} />
          <SupervisionActivitySection projectId={projectId} active={active} />
        </>
      ) : (
        <EmptyState
          icon={<EyeIcon className="text-muted-foreground size-8" aria-hidden />}
          title={t('dashboard.supervision.notActive.title')}
          description={t('dashboard.supervision.notActive.body')}
        />
      )}
    </>
  );
}
