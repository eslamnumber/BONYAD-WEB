import { z } from 'zod';

/**
 * Strict request schemas for the change-request endpoints (CLAUDE rule 1: request
 * bodies are zod-validated). Response shapes live in `change-request.ts` as
 * permissive TS types. Field names mirror the iOS `ChangeRequestService` payloads
 * and are verified against dev records 12/13.
 */

/** A brand-new phase — no `phaseId`, needs description + time + money. */
const createPhaseChangeSchema = z.object({
  actionType: z.literal('CREATE'),
  description: z.string().trim().min(1),
  timeSpentDays: z.number().int().nonnegative(),
  moneySpent: z.number().nonnegative(),
  phaseNumber: z.number().int().optional(),
  orderIndex: z.number().int().optional(),
});

/** Edit an existing phase — needs its `phaseId`; changed fields optional. */
const updatePhaseChangeSchema = z.object({
  actionType: z.literal('UPDATE'),
  phaseId: z.number().int().positive(),
  description: z.string().trim().min(1).optional(),
  timeSpentDays: z.number().int().nonnegative().optional(),
  moneySpent: z.number().nonnegative().optional(),
  phaseNumber: z.number().int().optional(),
  orderIndex: z.number().int().optional(),
});

/** Remove an existing phase — needs only its `phaseId`. */
const deletePhaseChangeSchema = z.object({
  actionType: z.literal('DELETE'),
  phaseId: z.number().int().positive(),
});

/** A single phase mutation — discriminated on `actionType` so each variant gets
 *  exactly the fields the backend requires (cleaner than a manual refine). */
export const phaseChangeInputSchema = z.discriminatedUnion('actionType', [
  createPhaseChangeSchema,
  updatePhaseChangeSchema,
  deletePhaseChangeSchema,
]);

export type PhaseChangeInput = z.infer<typeof phaseChangeInputSchema>;

/**
 * Body for POST /change-requests/project/:projectId/request. `description` is the
 * only required field; `newBudget` is the new project **total**; the email/phone
 * fields are best-effort notification hints (kept as plain optional strings, not
 * format-enforced — a malformed contact must never block a negotiation).
 */
export const createChangeRequestSchema = z.object({
  description: z.string().trim().min(1),
  newBudget: z.number().positive().optional(),
  userEmail: z.string().optional(),
  technicianEmail: z.string().optional(),
  userPhone: z.string().optional(),
  technicianPhone: z.string().optional(),
  phaseChanges: z.array(phaseChangeInputSchema).optional(),
});

export type CreateChangeRequestInput = z.infer<typeof createChangeRequestSchema>;

/** Body for POST /change-requests/:id/respond — the counter-offer reply text. */
export const respondChangeRequestSchema = z.object({
  response: z.string().trim().min(1),
});

export type RespondChangeRequestInput = z.infer<typeof respondChangeRequestSchema>;

/** Only signing method the backend currently supports. */
export const SIGNING_METHODS = ['EMAIL'] as const;

/** Body for POST /change-requests/:id/agree — per-party agreement. */
export const agreeChangeRequestSchema = z.object({
  agreedChanges: z.string().trim().min(1).optional(),
  signingMethod: z.enum(SIGNING_METHODS).default('EMAIL'),
});

export type AgreeChangeRequestInput = z.infer<typeof agreeChangeRequestSchema>;

/** Body for POST /change-requests/:id/reject — optional reason. */
export const rejectChangeRequestSchema = z.object({
  reason: z.string().trim().min(1).optional(),
});

export type RejectChangeRequestInput = z.infer<typeof rejectChangeRequestSchema>;
