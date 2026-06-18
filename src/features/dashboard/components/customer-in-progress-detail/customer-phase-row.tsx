'use client';

import { useTranslation } from 'react-i18next';

import { ChevronUpIcon, PhaseCheckIcon } from '@/components/icons';

import { type PhaseProgress, paymentState } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

type Props = {
  phase: ProjectPhase;
  state: PhaseProgress;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  /** Approve → opens the payment-options modal (sub-phase 5d). */
  onApprove: () => void;
  /** Request changes → the change-request flow (deferred; a visual placeholder
   *  with no handler until that feature lands, like the technician timeline). */
  onRequestChanges?: () => void;
};

/**
 * One phase row in the customer's in-progress timeline (Figma node 1547:1827). A
 * clickable summary (chevron · phase badge + title + short description · status
 * icon) that expands to the per-phase actions. Unlike the technician's
 * {@link PhaseStep} (request-approval / add-update), the customer sees **Approve**
 * (→ payment) + **Request changes** — shown only while the phase still has a
 * balance (payment state ≠ paid). `upcoming` phases dim to 75%.
 */
export function CustomerPhaseRow({
  phase,
  state,
  index,
  expanded,
  onToggle,
  onApprove,
  onRequestChanges,
}: Props) {
  const number = phase.phaseNumber ?? index + 1;
  const showActions = expanded && paymentState(phase.paymentStatus) !== 'paid';

  return (
    <div
      className={`border-border border-b last:border-b-0 ${state === 'upcoming' ? 'opacity-75' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="focus-visible:outline-ring flex w-full items-center justify-between gap-3 py-4 focus-visible:outline-2"
      >
        <ChevronUpIcon
          className={`text-muted-foreground size-5 shrink-0 ${expanded ? '' : '-scale-y-100'}`}
          aria-hidden
        />
        <div className="flex min-w-0 items-start gap-3">
          <PhaseSummary phase={phase} number={number} />
          <StatusIcon state={state} />
        </div>
      </button>

      {showActions ? (
        <PhaseActions onApprove={onApprove} onRequestChanges={onRequestChanges} />
      ) : null}
    </div>
  );
}

/** Phase badge + title + optional short description (Figma 1547:1832). */
function PhaseSummary({ phase, number }: { phase: ProjectPhase; number: number }) {
  const { t } = useTranslation();
  const title = phase.title ?? phase.description;
  const subtitle = phase.title && phase.description !== phase.title ? phase.description : null;

  return (
    <div className="flex min-w-0 flex-col items-end gap-2 text-end">
      <span className="bg-field-surface text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-semibold">
        {t('dashboard.projectDetail.phases.phaseLabel', { number })}
      </span>
      {title ? (
        <span className="text-foreground line-clamp-2 text-lg font-semibold" dir="auto">
          {title}
        </span>
      ) : null}
      {subtitle ? (
        <span className="text-muted-foreground line-clamp-2 text-sm" dir="auto">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}

function StatusIcon({ state }: { state: PhaseProgress }) {
  if (state === 'completed') {
    return (
      <span
        className="bg-paid flex size-5 shrink-0 items-center justify-center rounded-full"
        aria-hidden
      >
        <PhaseCheckIcon className="text-on-media size-2.5" />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span
        className="border-status-progress size-5 shrink-0 rounded-full border-2 border-dashed"
        aria-hidden
      />
    );
  }
  return <span className="border-upcoming/40 size-5 shrink-0 rounded-full border-2" aria-hidden />;
}

function PhaseActions({
  onApprove,
  onRequestChanges,
}: {
  onApprove: () => void;
  onRequestChanges?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap justify-end gap-2 pb-4">
      <button
        type="button"
        onClick={onRequestChanges}
        className="border-brand-dark-navy text-brand-dark-navy focus-visible:outline-ring rounded-lg border px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.projectDetail.phases.requestChanges')}
      </button>
      <button
        type="button"
        onClick={onApprove}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.projectDetail.phases.approve')}
      </button>
    </div>
  );
}
