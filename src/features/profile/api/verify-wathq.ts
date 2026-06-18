import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { wathqVerifyRequestSchema, type WathqVerifyResult } from '../schemas/company';

/**
 * Verify (via Wathq) that a national ID is an authorised signatory for a
 * Commercial Registration. Mirrors the iOS call site
 * CompanyModeToggleView.swift:245 — POST /wathq/verify with `{ nationalId,
 * crNumber }`. The strict {@link wathqVerifyRequestSchema} validates the body
 * before sending (hard rule 1); the response is permissive. Browser calls go
 * through `/api/proxy/*`, which attaches the session token.
 */
export async function verifyWathq(input: {
  nationalId: string;
  crNumber: string;
}): Promise<WathqVerifyResult> {
  const body = wathqVerifyRequestSchema.parse(input);
  return apiClient.post<WathqVerifyResult>(API_ENDPOINTS.WATHQ.VERIFY, { body });
}
