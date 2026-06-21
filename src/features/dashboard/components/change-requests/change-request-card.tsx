'use client';

import { useTranslation } from 'react-i18next';

import { formatBudget } from '../../lib/project-format';
import type { ChangeRequest } from '../../schemas/change-request';

import { AgreementProgress } from './agreement-progress';
import { ChangeRequestStatusBadge } from './change-request-status-badge';

type Props = { cr: ChangeRequest; isTechnician: boolean; onView: () => void };

/**
 * One active negotiation, summarised: status pill + requester, the description,
 * the new total budget / phase-change count, the two-party agreement progress,
 * and a "View details" button that opens the thread. Tapping anywhere on the
 * action opens {@link ChangeRequestThread} via `onView`.
 */
export function ChangeRequestCard({ cr, isTechnician, onView }: Props) {
  const { t } = useTranslation();
  const phaseCount = cr.phaseChanges?.length ?? 0;

  return (
    <article className="border-border bg-card flex w-full flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <ChangeRequestStatusBadge status={cr.status} />
        {cr.requestedBy && (
          <p dir="auto" className="text-muted-foreground min-w-0 truncate text-start text-xs">
            {t('dashboard.changeRequests.card.requestedBy', { name: cr.requestedBy })}
          </p>
        )}
      </div>

      {cr.description && (
        <p dir="auto" className="text-foreground line-clamp-2 text-start text-sm">
          {cr.description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs">
        {typeof cr.newBudget === 'number' && (
          <span className="text-foreground">
            <span className="text-muted-foreground">
              {t('dashboard.changeRequests.card.budget')}:{' '}
            </span>
            {formatBudget(cr.newBudget)}
          </span>
        )}
        {phaseCount > 0 && (
          <span className="text-muted-foreground">
            {t('dashboard.changeRequests.card.phaseChangesCount', { count: phaseCount })}
          </span>
        )}
      </div>

      <AgreementProgress cr={cr} isTechnician={isTechnician} />

      <button
        type="button"
        onClick={onView}
        className="border-brand-dark-navy text-brand-dark-navy focus-visible:outline-ring self-end rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('dashboard.changeRequests.card.view')}
      </button>
    </article>
  );
}
