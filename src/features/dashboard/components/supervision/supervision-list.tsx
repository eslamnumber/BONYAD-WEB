'use client';

import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { EyeIcon } from '@/components/icons';

import { useSupervisingProjects, type SupervisingFilter } from '../../api';

import { SupervisionActiveCard } from './supervision-active-card';
import { SupervisionInvitationCard } from './supervision-invitation-card';

/**
 * The list body for one supervision bucket — fetches PROJECTS.SUPERVISING for the
 * given status and renders the loading / error / empty / populated states. Invited
 * projects render an invitation card (accept/decline); active ones a manage card.
 */
export function SupervisionList({ status }: { status: SupervisingFilter }) {
  const { t } = useTranslation();
  const query = useSupervisingProjects(status);

  if (query.isPending) return <LoadingState label={t('common.loading')} />;
  if (query.isError) {
    return (
      <ErrorState
        title={t('dashboard.supervision.error.title')}
        description={t('dashboard.supervision.error.body')}
        retryLabel={t('common.tryAgain')}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const projects = query.data ?? [];
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<EyeIcon className="text-muted-foreground size-8" aria-hidden />}
        title={t(`dashboard.supervision.${status}.empty.title`)}
        description={t(`dashboard.supervision.${status}.empty.body`)}
      />
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-5">
      {projects.map((project) => (
        <div key={project.id} className="w-full lg:w-[calc(50%-0.625rem)]">
          {status === 'invited' ? (
            <SupervisionInvitationCard project={project} />
          ) : (
            <SupervisionActiveCard project={project} />
          )}
        </div>
      ))}
    </div>
  );
}
