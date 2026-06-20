import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SowDocument, SowMilestone } from './sow-types';

export type CreatePhaseBody = {
  projectId: number;
  phaseNumber: number;
  description: string;
  timeSpentDays: number;
  moneySpent: number;
};

/** Create one phase (iOS `PhaseService.createPhase`). */
export async function createPhase(body: CreatePhaseBody): Promise<unknown> {
  return apiClient.post<unknown>(API_ENDPOINTS.PHASES.CREATE, { body });
}

/** Map a SOW milestone → phase body (iOS: `timeSpentDays = max(week*7,1)`, money from grand_total.min). */
export function milestoneToPhase(
  projectId: number,
  milestone: SowMilestone,
  phaseNumber: number,
  grandTotalMin: number,
): CreatePhaseBody {
  const week = typeof milestone.week === 'number' ? milestone.week : phaseNumber;
  const percent = typeof milestone.payment_percent === 'number' ? milestone.payment_percent : 0;
  return {
    projectId,
    phaseNumber,
    description: (milestone.name ?? `Phase ${phaseNumber}`).trim(),
    timeSpentDays: Math.max(week * 7, 1),
    moneySpent: Math.round(((grandTotalMin * percent) / 100) * 100) / 100,
  };
}

/**
 * Create every milestone as a phase, best-effort (iOS uses `try?` per phase — a
 * failed phase never aborts project creation). Milestones are sorted by week.
 * Returns the count that succeeded.
 */
export async function createPhasesFromSow(projectId: number, sow: SowDocument): Promise<number> {
  const milestones = [...(sow.timeline?.milestones ?? [])].sort(
    (a, b) => (a.week ?? 0) - (b.week ?? 0),
  );
  const grandTotalMin = sow.commercials?.cost_breakdown?.grand_total?.min ?? 0;

  let created = 0;
  for (let i = 0; i < milestones.length; i += 1) {
    const milestone = milestones[i];
    if (!milestone) continue;
    try {
      await createPhase(milestoneToPhase(projectId, milestone, i + 1, grandTotalMin));
      created += 1;
    } catch {
      // best-effort — skip a failed phase, keep going.
    }
  }
  return created;
}
