import { z } from 'zod';

/**
 * Owner project-edit contracts (RN OwnerProjectEditScreen — GET/PUT
 * /projects/:id/owner-edit). The screen captures a project NAME and DESCRIPTION
 * separately but the backend stores them in a single `description` field as
 * `"name\n\ndescription"`; budget can be left "unspecified" (→ null); each phase
 * carries an amount (`moneySpent`) and a duration the form captures in WEEKS and
 * the backend stores in days (`timeSpentDays`). Mapping lives in
 * `../lib/owner-edit-mapping` so this file stays declarative.
 */

/** Permissive GET response — only fields the form reads are typed (CLAUDE rule 1). */
export type OwnerEditResponse = {
  project?: {
    description?: string;
    budget?: number | null;
    address?: string;
    files?: string[];
    photos?: string[];
  };
  phases?: {
    id?: number | null;
    phaseNumber?: number | string;
    description?: string;
    timeSpentDays?: number | string | null;
    moneySpent?: number | string | null;
  }[];
};

/** A phase row as the form holds it — raw string inputs (`id` null until saved). */
export const ownerEditPhaseFormSchema = z.object({
  id: z.number().nullable(),
  phaseNumber: z.string(),
  description: z
    .string()
    .trim()
    .min(1, { message: 'dashboard.projectEdit.errors.phaseDescriptionRequired' }),
  durationWeeks: z.string().trim(),
  amount: z.string().trim(),
});
export type EditablePhase = z.infer<typeof ownerEditPhaseFormSchema>;

/** Form values (string inputs). Validations mirror RN `validateForm`. */
export const ownerEditFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'dashboard.projectEdit.errors.nameRequired' }),
    description: z
      .string()
      .trim()
      .min(1, { message: 'dashboard.projectEdit.errors.descriptionRequired' }),
    budgetUnspecified: z.boolean(),
    budget: z.string().trim(),
    address: z.string().trim(),
    existingPhotos: z.array(z.string()),
    phases: z.array(ownerEditPhaseFormSchema),
  })
  .refine((v) => v.budgetUnspecified || !v.budget || Number(v.budget.replace(/,/g, '')) > 0, {
    message: 'dashboard.projectEdit.errors.budgetInvalid',
    path: ['budget'],
  });
export type OwnerEditFormValues = z.infer<typeof ownerEditFormSchema>;

/** Strict PUT body. `budget`/per-phase metrics are omitted (not nulled) when blank. */
export const ownerEditPhasePayloadSchema = z.object({
  id: z.number().nullable(),
  description: z.string(),
  phaseNumber: z.number().int(),
  timeSpentDays: z.number().int().positive().optional(),
  moneySpent: z.number().nonnegative().optional(),
});
export type OwnerEditPhasePayload = z.infer<typeof ownerEditPhasePayloadSchema>;

export const ownerEditPayloadSchema = z.object({
  description: z.string(),
  budget: z.number().positive().optional(),
  address: z.string(),
  phases: z.array(ownerEditPhasePayloadSchema),
  existingPhotos: z.array(z.string()).optional(),
});
export type OwnerEditPayload = z.infer<typeof ownerEditPayloadSchema>;
