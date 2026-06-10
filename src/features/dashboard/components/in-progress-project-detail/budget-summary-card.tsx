'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { budgetSummary } from '../../lib/project-finance';
import { type ProjectDetail } from '../../schemas/project';
import { type ProjectPhase } from '../../schemas/project-phase';
import { MoneyAmount } from '../money-amount';

import { DetailCard } from './detail-card';

type Props = { project: ProjectDetail; phases: ProjectPhase[]; pending?: boolean };

const DASH = '—';

/**
 * Budget summary card (Figma node 1103:6632): total budget · paid so far ·
 * remaining · phase count. Backend-driven — totals derive from `PROJECTS.DETAILS`
 * (budget) + `PHASES.LIST` (settled phase amounts) via {@link budgetSummary}.
 * While the phases query is in flight, the phase-derived rows show "—" rather than
 * flashing a misleading 0.
 */
export function BudgetSummaryCard({ project, phases, pending }: Props) {
  const { t } = useTranslation();
  const { total, paid, remaining, phaseCount } = budgetSummary(project, phases);

  return (
    <DetailCard heading={t('dashboard.projectDetail.summary.heading')}>
      <Row label={t('dashboard.projectDetail.summary.totalBudget')}>
        {total !== null ? <MoneyAmount value={total} /> : DASH}
      </Row>
      <Row label={t('dashboard.projectDetail.summary.paid')}>
        {pending ? DASH : <MoneyAmount value={paid} />}
      </Row>
      <Row label={t('dashboard.projectDetail.summary.remaining')}>
        {pending || remaining === null ? DASH : <MoneyAmount value={remaining} />}
      </Row>
      <Row label={t('dashboard.projectDetail.summary.phasesLabel')}>
        {pending ? DASH : t('dashboard.projectDetail.summary.phasesValue', { count: phaseCount })}
      </Row>
    </DetailCard>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-full items-start justify-between text-sm">
      <span className="text-foreground font-medium">
        <bdi>{children}</bdi>
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
