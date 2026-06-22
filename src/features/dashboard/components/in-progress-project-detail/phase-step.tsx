'use client';

import { useTranslation } from 'react-i18next';

import { ChevronUpIcon, PhaseCheckIcon } from '@/components/icons';
import { ApiError } from '@/lib/api-client';

import { useRequestPhasePayment } from '../../api/request-phase-payment';
import { type PhaseProgress, phasePaymentAction } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

type Props = {
  phase: ProjectPhase;
  state: PhaseProgress;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  /** Owning project — used to wire + invalidate the request-payment mutation. */
  projectId: number;
};

/**
 * One phase row in the timeline (Figma `Step` component, node 1103:6694). A
 * clickable summary (chevron · phase badge + title · status icon) that toggles an
 * expandable body of phase actions. `upcoming` phases dim to 75%.
 *
 * Notes vs Figma: the expanded body flows naturally (the Figma's absolute layout +
 * fixed height is replaced so the row grows with content / stays responsive). The
 * per-phase attachments/images moved out to project-level cards (ProjectImagesCard +
 * AttachmentsCard); the remaining action buttons are visual placeholders until their
 * phase mutations are wired.
 */
export function PhaseStep({ phase, state, index, expanded, onToggle, projectId }: Props) {
  const { t } = useTranslation();
  const number = phase.phaseNumber ?? index + 1;

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
          <div className="flex min-w-0 flex-col items-end gap-2 text-end">
            <span className="bg-field-surface text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-semibold">
              {t('dashboard.projectDetail.phases.phaseLabel', { number })}
            </span>
            {phase.description ? (
              <span className="text-foreground line-clamp-2 text-lg font-semibold" dir="auto">
                {phase.description}
              </span>
            ) : null}
          </div>
          <StatusIcon state={state} />
        </div>
      </button>

      {expanded ? <PhaseBody phase={phase} projectId={projectId} /> : null}
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

function PhaseBody({ phase, projectId }: { phase: ProjectPhase; projectId: number }) {
  return (
    <div className="flex flex-wrap justify-end gap-3 pb-4">
      <PhasePaymentAction phase={phase} projectId={projectId} />
    </div>
  );
}

/**
 * Technician "Request payment" action — POST /phases/:id/request-payment (mirrors RN
 * PhaseService.requestPayment). Shown only when the phase is approved + PENDING; once
 * requested it becomes a non-interactive "Payment requested" badge (awaiting the
 * customer). The button disables while in flight (no double-submit, RN fix #19) and
 * surfaces a localized error inline (RN swallowed it).
 */
function PhasePaymentAction({ phase, projectId }: { phase: ProjectPhase; projectId: number }) {
  const { t, i18n } = useTranslation();
  const action = phasePaymentAction(phase);
  const mutation = useRequestPhasePayment(projectId);

  if (action === 'requested') {
    return (
      <span className="bg-status-progress-soft text-status-progress inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium">
        {t('dashboard.projectDetail.phases.paymentRequested')}
      </span>
    );
  }
  if (action !== 'request') return null;

  const errorMessage =
    mutation.error instanceof ApiError
      ? (mutation.error.localizedMessage(i18n.language) ??
        t('dashboard.projectDetail.phases.requestPaymentError'))
      : t('dashboard.projectDetail.phases.requestPaymentError');

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => mutation.mutate(phase.id)}
        disabled={mutation.isPending}
        aria-busy={mutation.isPending}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {t('dashboard.projectDetail.phases.requestPayment')}
      </button>
      {mutation.isError ? (
        <p className="text-destructive text-end text-xs" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
