'use client';

import { useTranslation } from 'react-i18next';

import { PhaseCheckIcon } from '@/components/icons';

import { paymentState } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

/**
 * Project phases card (Figma 1103:6819 "Steps"): one row per phase — a "Phase N"
 * badge, the phase text, and a green completion check. Backend-driven from
 * `PHASES.LIST`. The Figma `Step` is an expandable component (collapsed Variant2
 * here); its expanded state holds per-phase attachments + action buttons, but the
 * backend Phase carries no attachments and a completed phase has no pending action,
 * so we render the collapsed row only and drop the collapse chevron (it would imply
 * an expand that reveals nothing). The backend Phase has a single `description` and
 * no short name, so the badge is the phase number and `description` is the row text.
 */
export function CompletedPhasesCard({
  phases,
  pending,
}: {
  phases: ProjectPhase[];
  pending?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <section className="bg-card border-border flex w-full flex-col gap-2 rounded-xl border px-5 py-6">
      <div className="flex w-full flex-col gap-4">
        <h2 className="text-foreground text-end text-lg font-medium">
          {t('dashboard.jobOffer.phases.heading')}
        </h2>
        <hr className="border-border w-full border-t" />
      </div>
      {pending ? (
        <p className="text-foreground/60 text-end text-sm">
          {t('dashboard.jobOffer.phases.loading')}
        </p>
      ) : (
        <ol className="divide-border flex w-full flex-col divide-y">
          {phases.map((phase, i) => (
            <PhaseStep key={phase.id} phase={phase} index={i} />
          ))}
        </ol>
      )}
    </section>
  );
}

function PhaseStep({ phase, index }: { phase: ProjectPhase; index: number }) {
  const { t } = useTranslation();
  const number = phase.phaseNumber ?? index + 1;
  const done = phase.completed === true || paymentState(phase.paymentStatus) === 'paid';

  return (
    <li className="flex items-start justify-end gap-6 py-4">
      <div className="flex min-w-0 flex-col items-end gap-2">
        <span className="bg-field-surface text-muted-foreground rounded-md px-2.5 py-1 text-[11px] font-semibold">
          {t('dashboard.completedProject.steps.phaseBadge', { number })}
        </span>
        {phase.description ? (
          <h3 className="text-foreground text-end text-lg font-semibold">
            <bdi>{phase.description}</bdi>
          </h3>
        ) : null}
      </div>
      <CompletionMark done={done} />
    </li>
  );
}

function CompletionMark({ done }: { done: boolean }) {
  const { t } = useTranslation();
  if (!done)
    return <span className="border-border size-5 shrink-0 rounded-full border-2" aria-hidden />;
  return (
    <span className="bg-paid flex size-5 shrink-0 items-center justify-center rounded-full">
      <PhaseCheckIcon className="text-on-media size-2.5" aria-hidden />
      <span className="sr-only">{t('dashboard.projects.status.completed')}</span>
    </span>
  );
}
