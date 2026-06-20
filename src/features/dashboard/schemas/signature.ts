import { z } from 'zod';

/**
 * Request body for POST /signatures (create / resend the e-sign request). Strict
 * (CLAUDE rule 1: request bodies are zod-validated). Mirrors the RN email path
 * website-bonyad/src/services/SignatureService.ts:143 (`createEmailSignatureRequest`)
 * — a form-urlencoded body of `projectId` + `phaseIds` (sent as **repeated** fields)
 * + `language` (upper-case locale), optionally `contractTerms`. The backend
 * auto-fetches both parties' emails from their profiles, so — unlike the older
 * phase-approval call site — no `userEmail` / `technicianEmail` / `technicianId` is
 * sent. The fetcher serialises this into `URLSearchParams`.
 */
export const signatureRequestSchema = z.object({
  projectId: z.number().int().positive(),
  phaseIds: z.array(z.number().int().positive()).min(1),
  language: z.enum(['EN', 'AR']),
  contractTerms: z.string().trim().min(1).optional(),
});

export type SignatureRequest = z.infer<typeof signatureRequestSchema>;
