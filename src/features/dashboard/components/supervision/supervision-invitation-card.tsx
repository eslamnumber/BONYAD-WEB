'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';

import { useRespondSupervisorInvite } from '../../api';
import type { SupervisingProject } from '../../schemas/supervisor';

import { SupervisionProjectSummary } from './supervision-project-summary';
import { SupervisorStatusPill } from './supervisor-status-pill';

/** Minimal view of the respond mutation needed to render the per-card action state. */
type RespondLike = {
  isPending: boolean;
  isError: boolean;
  variables?: { projectId: number; accept: boolean };
};

/** Derive this card's action state from the (shared) respond mutation — kept out of
 *  the component so the JSX stays simple (and under the complexity cap). */
function rowState(respond: RespondLike, projectId: number) {
  const onThis = respond.variables?.projectId === projectId;
  const pending = respond.isPending && onThis;
  const accept = respond.variables?.accept;
  return {
    pending,
    accepting: pending && accept === true,
    declining: pending && accept === false,
    errored: respond.isError && onThis,
  };
}

/**
 * One pending supervision invitation — project summary plus Accept / Decline (POST
 * …/supervisor/respond) and a read-only "view details" link into the existing project
 * detail. On success the supervision queries invalidate and the card leaves the
 * Invitations list (the accepted project reappears under Active).
 */
export function SupervisionInvitationCard({ project }: { project: SupervisingProject }) {
  const { t } = useTranslation();
  const respond = useRespondSupervisorInvite();
  const s = rowState(respond, project.id);

  return (
    <article className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex justify-end">
        <SupervisorStatusPill status="INVITED" />
      </div>

      <SupervisionProjectSummary project={project} />

      {s.errored ? (
        <p role="alert" className="text-destructive text-end text-sm">
          {t('dashboard.supervision.respond.error')}
        </p>
      ) : null}

      {/* col-reverse → primary on top on mobile; sm:flex-row + justify-end → primary at
          the inline-end on desktop, mirroring under the inverted map with no row reversal. */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button asChild variant="ghost" size="md" className="w-full sm:me-auto sm:w-auto">
          <Link href={`${ROUTES.DASHBOARD_PROJECT(String(project.id))}?supervisor=1`}>
            {t('dashboard.supervision.card.viewDetails')}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="md"
          disabled={s.pending}
          onClick={() => respond.mutate({ projectId: project.id, accept: false })}
          className="w-full sm:w-auto"
        >
          {s.declining
            ? t('dashboard.supervision.respond.declining')
            : t('dashboard.supervision.card.decline')}
        </Button>
        <Button
          size="md"
          disabled={s.pending}
          onClick={() => respond.mutate({ projectId: project.id, accept: true })}
          className="w-full sm:w-auto"
        >
          {s.accepting
            ? t('dashboard.supervision.respond.accepting')
            : t('dashboard.supervision.card.accept')}
        </Button>
      </div>
    </article>
  );
}
