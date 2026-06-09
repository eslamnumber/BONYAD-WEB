'use client';

import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { phaseProgress } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

import { PhaseStep } from './phase-step';

type Props = { phases: ProjectPhase[]; pending?: boolean };

/**
 * Project phases timeline card (Figma node 1103:6689): a heading + a list of
 * expandable phase steps. The active (first not-yet-completed) phase is expanded
 * by default; toggling a step collapses the rest (single-open accordion).
 * Backend-driven from `PHASES.LIST`. No drop-shadow per the Figma node.
 */
export function ProjectPhasesTimeline({ phases, pending }: Props) {
  const { t } = useTranslation();
  const states = phaseProgress(phases);
  const activeId = phases.find((_, i) => states[i] === 'active')?.id ?? null;
  // 'auto' follows the active phase until the user explicitly toggles a step.
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
      />
    </section>
  );
}

type ListProps = {
  phases: ProjectPhase[];
  states: ReturnType<typeof phaseProgress>;
  pending?: boolean;
  openId: number | null;
  onToggle: (id: number) => void;
};

function PhaseList({ phases, states, pending, openId, onToggle }: ListProps) {
  const { t } = useTranslation();
  if (pending) return <Note>{t('dashboard.projectDetail.phases.loading')}</Note>;
  if (phases.length === 0) return <Note>{t('dashboard.projectDetail.phases.empty')}</Note>;

  return (
    <div className="flex w-full flex-col">
      {phases.map((phase, i) => (
        <PhaseStep
          key={phase.id}
          phase={phase}
          state={states[i] ?? 'upcoming'}
          index={i}
          expanded={openId === phase.id}
          onToggle={() => onToggle(phase.id)}
        />
      ))}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-end text-sm">{children}</p>;
}
