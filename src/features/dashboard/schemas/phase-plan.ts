import { z } from 'zod';

/**
 * Request body for `POST /phases` and `PUT /phases/:phaseId` — strict (rule 1:
 * request bodies use zod). Mirrors the iOS phase write payload
 * (bonayd-ios/.../new_request/PhasePlanningView.swift): the editor never sends a
 * `title`, only the description/duration/cost the technician can change.
 */
export const phaseWriteSchema = z.object({
  projectId: z.number(),
  phaseNumber: z.number(),
  description: z.string().min(1),
  timeSpentDays: z.number().nonnegative(),
  moneySpent: z.number().nonnegative(),
});

export type PhaseWrite = z.infer<typeof phaseWriteSchema>;

/** One edited phase before the `projectId` is attached by the fetcher. */
export type PhaseDraft = Omit<PhaseWrite, 'projectId'>;

/**
 * The diff the edit-phase-plan editor submits: re-send every surviving phase
 * (`updates`, like the iOS submit loop), create the new ones, delete the removed
 * ids. Consumed by `savePhasePlan`.
 */
export type PhasePlanSaveInput = {
  updates: (PhaseDraft & { id: number })[];
  creates: PhaseDraft[];
  deletes: number[];
};
