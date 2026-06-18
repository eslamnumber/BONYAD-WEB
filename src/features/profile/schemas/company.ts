import { z } from 'zod';

/**
 * Company-mode (Wathq) account schemas for the Account-type screen. Mirrors the
 * iOS call site CompanyModeToggleView.swift: switching to Company first verifies
 * the national ID is an authorised signatory for the Commercial Registration via
 * `POST /wathq/verify`, then flips the profile with `PUT /users/:userId/profile`.
 *
 * Request bodies are strict zod (hard rule 1); the Wathq response is a permissive
 * TS `type` — the backend is shared with the iOS app and may add flags, and a
 * strict response schema would surface that as a misleading "Something went wrong".
 */

/** A Saudi Commercial Registration number — exactly 10 digits (iOS `crNumber.count == 10`). */
const crNumber = z.string().regex(/^\d{10}$/);

/** POST /wathq/verify request — `{ nationalId, crNumber }`. */
export const wathqVerifyRequestSchema = z.object({
  nationalId: z.string().trim().min(1),
  crNumber,
});

export type WathqVerifyRequest = z.infer<typeof wathqVerifyRequestSchema>;

/**
 * POST /wathq/verify response. `authorized` is the only field the flow gates on;
 * `isCrFound` / `isNidFound` disambiguate the failure into a localised message
 * (CR not found / national ID not found / national ID not authorised for the CR).
 */
export type WathqVerifyResult = {
  authorized?: boolean;
  isCrFound?: boolean;
  isNidFound?: boolean;
  message?: string;
};

/** PUT /users/:userId/profile body — switch to Company (after a passed Wathq check). */
export const switchToCompanyRequestSchema = z.object({
  isCompany: z.literal(true),
  companyName: z.string().trim().min(1),
  crNumber,
  nationalId: z.string().trim().min(1),
});

export type SwitchToCompanyRequest = z.infer<typeof switchToCompanyRequestSchema>;

/** PUT /users/:userId/profile body — switch back to Individual. */
export const switchToIndividualRequestSchema = z.object({ isCompany: z.literal(false) });

export type SwitchToIndividualRequest = z.infer<typeof switchToIndividualRequestSchema>;
