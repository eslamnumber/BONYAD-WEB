import { z } from 'zod';

/**
 * Request body for POST /signatures (create / resend the e-sign request). Strict
 * (CLAUDE rule 1: request bodies are zod-validated). Mirrors the RN call site
 * website-bonyad/src/screens/projects/in-progress/modals/hooks/usePhaseApprovalData.ts:170
 * — a form-urlencoded body where `phaseIds` is sent as a comma-joined CSV and
 * `language` is the upper-case locale. The fetcher serialises this into
 * `URLSearchParams`.
 */
export const signatureRequestSchema = z.object({
  projectId: z.number().int().positive(),
  technicianId: z.number().int().positive(),
  userEmail: z.string().email(),
  technicianEmail: z.string().email(),
  phaseIds: z.array(z.number().int().positive()).min(1),
  language: z.enum(['EN', 'AR']),
});

export type SignatureRequest = z.infer<typeof signatureRequestSchema>;
