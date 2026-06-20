import { z } from 'zod';

import { emptyPhaseInput } from './phase-input';

const E = 'dashboard.createProject.errors';

/** A phase row as the wizard holds it — raw string inputs (step 4). */
export const createProjectPhaseFormSchema = z.object({
  name: z.string().trim(),
  durationWeeks: z.string().trim(),
  amount: z.string().trim(),
  description: z.string().trim(),
});

/**
 * The full create-project wizard form — one lifted RHF instance, validated one
 * step at a time via {@link STEP_FIELDS}. String inputs throughout; the
 * `formValuesToSubmitVars` mapper normalizes them into the create + phases
 * payloads. `assignmentType` is the backend `projectType` (`ALL` = bidding).
 */
export const createProjectFormSchema = z
  .object({
    serviceCategoryId: z.string().min(1, { message: `${E}.categoryRequired` }),
    projectName: z
      .string()
      .trim()
      .min(1, { message: `${E}.nameRequired` }),
    description: z
      .string()
      .trim()
      .min(1, { message: `${E}.descriptionRequired` }),
    timelineWeeks: z.string().trim(),
    budget: z.string().trim(),
    noBudget: z.boolean(),
    deliverables: z.string().trim(),
    phases: z.array(createProjectPhaseFormSchema),
    assignmentType: z.enum(['ALL', 'DIRECT_ASSIGNMENT']),
    assignedTechnicianId: z.number().nullable(),
    /** Chosen technician's display name — surfaced on the review step only, never submitted. */
    assignedTechnicianName: z.string().trim(),
    /** Step 6 location — the selected region id + its localized name (sent as `address`). */
    regionId: z.string().trim(),
    regionName: z.string().trim(),
    /** Step 6 offer deadline (optional, `yyyy-mm-dd`). Captured but not yet submitted. */
    bidDeadline: z.string().trim(),
    /** Step 6 optional photos — uploaded as multipart `images` on create. */
    photos: z.array(z.custom<File>()),
  })
  .refine((v) => v.noBudget || !v.budget || Number(v.budget.replace(/[^\d]/g, '')) > 0, {
    message: `${E}.budgetInvalid`,
    path: ['budget'],
  })
  .refine((v) => v.assignmentType !== 'DIRECT_ASSIGNMENT' || v.assignedTechnicianId !== null, {
    message: `${E}.technicianRequired`,
    path: ['assignedTechnicianId'],
  });

export type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;

/** Fields validated when advancing past each step (index = step). */
export const STEP_FIELDS: (keyof CreateProjectFormValues)[][] = [
  ['serviceCategoryId', 'projectName', 'description'],
  ['timelineWeeks', 'budget', 'noBudget'],
  ['deliverables'],
  ['phases'],
  ['assignmentType', 'assignedTechnicianId'],
  ['regionId', 'regionName', 'bidDeadline'],
  // Step 7 (review) adds no new fields — every step was validated on the way in.
  [],
];

export function defaultCreateProjectValues(): CreateProjectFormValues {
  return {
    serviceCategoryId: '',
    projectName: '',
    description: '',
    timelineWeeks: '',
    budget: '',
    noBudget: false,
    deliverables: '',
    phases: [emptyPhaseInput()],
    assignmentType: 'ALL',
    assignedTechnicianId: null,
    assignedTechnicianName: '',
    regionId: '',
    regionName: '',
    bidDeadline: '',
    photos: [],
  };
}
