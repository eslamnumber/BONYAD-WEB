import { z } from 'zod';

/**
 * Strict request input for POST /projects/create. Mirrors the RN call site
 * website-bonyad/src/screens/projects/creation/hooks/useNewProjectView.ts:312
 * (`handleCreateProject`). The wizard collects string inputs; this is the
 * normalized shape the FormData builder ({@link buildCreateProjectFormData})
 * consumes. The request is multipart/form-data (the legacy create supports photo
 * uploads); the web wizard sends no files.
 *
 * `assignmentType` is the backend `projectType` value: `ALL` = open for bids,
 * `DIRECT_ASSIGNMENT` = assign one technician directly.
 */
export const createProjectRequestSchema = z
  .object({
    serviceCategoryId: z.number().int().positive(),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    /** Whole weeks as a numeric string; '' = unspecified (defaults to 1 week / 7 days). */
    timelineWeeks: z.string().trim().default(''),
    /** Numeric string (commas allowed); ignored when `noBudget` is true. */
    budget: z.string().trim().default(''),
    noBudget: z.boolean().default(false),
    /** Optional deliverables (step 3 "المخرجات"). */
    deliverables: z.string().trim().default(''),
    /** Location — the selected region's localized name (step 6). '' → "Not specified". */
    address: z.string().trim().default(''),
    assignmentType: z.enum(['ALL', 'DIRECT_ASSIGNMENT']),
    assignedTechnicianId: z.number().int().positive().nullable().default(null),
  })
  .refine((v) => v.assignmentType !== 'DIRECT_ASSIGNMENT' || v.assignedTechnicianId !== null, {
    message: 'A technician must be selected for direct assignment',
    path: ['assignedTechnicianId'],
  });

/** Loose caller shape (defaulted fields optional). */
export type CreateProjectInput = z.input<typeof createProjectRequestSchema>;
/** Normalized shape the FormData builder consumes. */
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;

/**
 * The created project. Permissive — RN reads `data.id || data.projectId` to chain
 * the phases POST, so only the id aliases are typed.
 */
export type CreateProjectResponse = {
  id?: number;
  projectId?: number;
};

/** The created project's id under either alias (RN: `data.id || data.projectId`). */
export function createdProjectId(res: CreateProjectResponse): number | undefined {
  return res.id ?? res.projectId;
}
