'use client';

import { useTranslation } from 'react-i18next';

import { formatBudget } from '../../lib/project-format';
import type { ChangeRequestPhaseChange } from '../../schemas/change-request';

/** Action chip colour: add = approved/green, edit = offer, remove = rejected/red. */
const ACTION_CLASS: Record<string, string> = {
  CREATE: 'bg-status-approved-soft text-status-approved',
  UPDATE: 'bg-status-offer-soft text-status-offer',
  DELETE: 'bg-status-rejected-soft text-status-rejected',
};

/** Read-only summary of the phase changes a request carries. Shared by the card
 *  and the thread message. Each row: the action chip at the inline-start, the
 *  phase description + cost packed to the inline-end. */
export function PhaseChangesList({ changes }: { changes: ChangeRequestPhaseChange[] }) {
  const { t } = useTranslation();
  if (changes.length === 0) return null;

  return (
    <ul className="flex w-full flex-col gap-2">
      {changes.map((change, index) => (
        <li
          key={`${change.actionType}-${change.phaseId ?? change.phaseNumber ?? index}`}
          className="border-border flex items-start justify-between gap-3 rounded-lg border p-3"
        >
          <span
            className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              ACTION_CLASS[change.actionType] ?? 'bg-muted text-muted-foreground'
            }`}
          >
            {t(`dashboard.changeRequests.phaseAction.${change.actionType}`, {
              defaultValue: change.actionType,
            })}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p dir="auto" className="text-foreground text-start text-sm">
              {change.description ||
                t('dashboard.changeRequests.phase.label', { number: change.phaseNumber ?? '—' })}
            </p>
            {typeof change.moneySpent === 'number' && (
              <p className="text-muted-foreground text-start text-xs">
                {formatBudget(change.moneySpent)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
