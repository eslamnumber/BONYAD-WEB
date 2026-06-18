'use client';

import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { paymentState, phaseProgress } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

import { CustomerPhaseRow } from './customer-phase-row';

type Props = {
  phases: ProjectPhase[];
  pending?: boolean;
  onApprovePhase: (phase: ProjectPhase) => void;
  onRequestChanges?: (phase: ProjectPhase) => void;
  /** Mark the whole project complete — enabled only once every phase is paid +
   *  completed (Figma node 1547:1679, disabled/opacity-40 otherwise). */
  onConfirmCompletion?: () => void;
};

/** All phases finished AND paid → the project can be confirmed complete (RN
 *  `canCompleteProject`: every `p.completed && p.paid`). */
function canCompleteProject(phases: ProjectPhase[]): boolean {
  return (
    phases.length > 0 &&
    phases.every((p) => p.completed && paymentState(p.paymentStatus) === 'paid')
  );
}

/**
 * Customer's project-phases timeline (Figma node 1547:1669 → phase item 1547:1827):
 * a heading + a single-open accordion of phase rows. The active (first
 * not-yet-completed) phase is expanded by default; toggling collapses the rest.
 * Each row exposes **Approve** (→ payment, sub-phase 5d) + **Request changes** —
 * the customer counterpart of the technician {@link ProjectPhasesTimeline}.
 * Backend-driven from `PHASES.LIST`.
 */
export function CustomerPhasesCard({
  phases,
  pending,
  onApprovePhase,
  onRequestChanges,
  onConfirmCompletion,
}: Props) {
  const { t } = useTranslation();
  const states = phaseProgress(phases);
  const activeId = phases.find((_, i) => states[i] === 'active')?.id ?? null;
  // 'auto' follows the active phase until the user explicitly toggles a row.
  const [expanded, setExpanded] = useState<number | null | 'auto'>('auto');
  const openId = expanded === 'auto' ? activeId : expanded;

  return (
    <section className="bg-card border-border flex w-full flex-col gap-4 rounded-xl border p-6">
      <div className="flex w-full flex-col items-end gap-4">
        <h2 className="text-foreground w-full text-end text-lg font-medium">
          {t('dashboard.projectDetail.phases.heading')}
        </h2>
        <hr className="border-border w-full border-t" />
      </div>
      <PhaseList
        phases={phases}
        states={states}
        pending={pending}
        openId={openId}
        onToggle={(id) => setExpanded(openId === id ? null : id)}
        onApprovePhase={onApprovePhase}
        onRequestChanges={onRequestChanges}
      />
      <button
        type="button"
        disabled={!canCompleteProject(phases) || !onConfirmCompletion}
        onClick={onConfirmCompletion}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring mt-2 w-full rounded-lg p-3 text-center text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 motion-safe:hover:opacity-90"
      >
        {t('dashboard.projectDetail.phases.confirmCompletion')}
      </button>
    </section>
  );
}

type ListProps = {
  phases: ProjectPhase[];
  states: ReturnType<typeof phaseProgress>;
  pending?: boolean;
  openId: number | null;
  onToggle: (id: number) => void;
  onApprovePhase: (phase: ProjectPhase) => void;
  onRequestChanges?: (phase: ProjectPhase) => void;
};

function PhaseList({
  phases,
  states,
  pending,
  openId,
  onToggle,
  onApprovePhase,
  onRequestChanges,
}: ListProps) {
  const { t } = useTranslation();
  if (pending) return <Note>{t('dashboard.projectDetail.phases.loading')}</Note>;
  if (phases.length === 0) return <Note>{t('dashboard.projectDetail.phases.empty')}</Note>;

  return (
    <div className="flex w-full flex-col">
      {phases.map((phase, i) => (
        <CustomerPhaseRow
          key={phase.id}
          phase={phase}
          state={states[i] ?? 'upcoming'}
          index={i}
          expanded={openId === phase.id}
          onToggle={() => onToggle(phase.id)}
          onApprove={() => onApprovePhase(phase)}
          onRequestChanges={onRequestChanges ? () => onRequestChanges(phase) : undefined}
        />
      ))}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-end text-sm">{children}</p>;
}
