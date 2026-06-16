import { z } from 'zod';

/** One create-project phase row (step 4). The wizard captures string inputs. */
export type PhaseInput = {
  name: string;
  durationWeeks: string;
  amount: string;
  description: string;
};

export const emptyPhaseInput = (): PhaseInput => ({
  name: '',
  durationWeeks: '',
  amount: '',
  description: '',
});

/**
 * Strict body for POST /phases. Mirrors the RN per-phase call in
 * website-bonyad/src/screens/projects/creation/hooks/useNewProjectView.ts:399-403
 * — `{ projectId, phaseNumber, title, description, timeSpentDays, moneySpent }`.
 * One POST per phase; `timeSpentDays` defaults to one week as RN does.
 */
export const createPhaseRequestSchema = z.object({
  projectId: z.number().int().positive(),
  phaseNumber: z.number().int().positive(),
  title: z.string().trim().default(''),
  description: z.string().trim().default(''),
  timeSpentDays: z.number().int().positive().default(7),
  moneySpent: z.number().nonnegative().optional(),
});

export type CreatePhaseRequest = z.infer<typeof createPhaseRequestSchema>;
export type CreatePhaseInput = z.input<typeof createPhaseRequestSchema>;
