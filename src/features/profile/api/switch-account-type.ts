import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  switchToCompanyRequestSchema,
  switchToIndividualRequestSchema,
  type WathqVerifyResult,
} from '../schemas/company';

import { myProfileQueryKey } from './get-my-profile';
import { verifyWathq } from './verify-wathq';

/**
 * Raised when the Wathq check returns `authorized: false`. Carries the response
 * flags so the UI can pick the exact localised reason (CR not found / national ID
 * not found / national ID not authorised for that CR) instead of surfacing the
 * raw backend string — mirrors the iOS branch in CompanyModeToggleView.swift:168.
 */
export class WathqNotAuthorizedError extends Error {
  constructor(public readonly result: WathqVerifyResult) {
    super('Wathq verification not authorized');
    this.name = 'WathqNotAuthorizedError';
  }
}

/** What the user is switching to. Company carries the registration details. */
export type SwitchAccountTypeVars =
  | { mode: 'individual' }
  | { mode: 'company'; companyName: string; crNumber: string; nationalId: string };

/**
 * PUT the user's profile by id. Mirrors the iOS call site
 * CompanyModeToggleView.swift:196,294 — PUT /users/:userId/profile (JSON body).
 */
async function putProfile(userId: number, body: Record<string, unknown>): Promise<void> {
  await apiClient.put<unknown>(
    API_ENDPOINTS.USERS.UPDATE_PROFILE_BY_ID.replace(':userId', String(userId)),
    { body },
  );
}

/**
 * Switch the account to Individual or Company. For Company this is the two-step
 * iOS flow: Wathq-verify first, and only on `authorized` PUT the company profile;
 * a failed check throws {@link WathqNotAuthorizedError} (no profile write).
 * Individual is a single PUT. Extracted from the hook so the branching is unit
 * testable without rendering.
 */
export async function switchAccountType(
  userId: number,
  vars: SwitchAccountTypeVars,
): Promise<void> {
  if (vars.mode === 'individual') {
    return putProfile(userId, switchToIndividualRequestSchema.parse({ isCompany: false }));
  }
  const result = await verifyWathq({ nationalId: vars.nationalId, crNumber: vars.crNumber });
  if (!result.authorized) throw new WathqNotAuthorizedError(result);
  const body = switchToCompanyRequestSchema.parse({
    isCompany: true,
    companyName: vars.companyName,
    crNumber: vars.crNumber,
    nationalId: vars.nationalId,
  });
  return putProfile(userId, body);
}

/** Mutation wrapper — invalidates the live profile so the screen re-reads the new type. */
export function useSwitchAccountType(userId: number) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SwitchAccountTypeVars>({
    mutationFn: (vars) => switchAccountType(userId, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myProfileQueryKey() });
    },
  });
}
