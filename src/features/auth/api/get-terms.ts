import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import { normalizeTerms, type TermsAndConditions } from '../schemas/terms.schema';

type Role = 'USER' | 'TECHNICIAN';

export const termsQueryKey = (role: Role) => ['terms', role] as const;

const endpointForRole = (role: Role) =>
  role === 'TECHNICIAN' ? API_ENDPOINTS.TERMS.TECHNICIAN : API_ENDPOINTS.TERMS.USER;

/**
 * Fetch the active Terms & Conditions for a role (public GET — no auth). A 404, an
 * empty body, or any payload without a numeric `id` resolves to `null` ("no active
 * terms" — the empty state), never an error. Mirrors the iOS `TermsService` nil
 * decode. Other non-2xx responses still throw `ApiError`.
 */
export async function getTerms(role: Role): Promise<TermsAndConditions | null> {
  try {
    const raw = await apiClient.get<unknown>(endpointForRole(role));
    return normalizeTerms(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Active terms for the selected signup role — cached per role; long stale time (rarely changes). */
export function useTerms(role: Role) {
  return useQuery({
    queryKey: termsQueryKey(role),
    queryFn: () => getTerms(role),
    staleTime: 5 * 60 * 1000,
  });
}
