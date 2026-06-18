import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import type { ReferralList } from '../types/referral';

export const referralsQueryKey = () => ['referral', 'list'] as const;

/**
 * The signed-in user's invitations + materialized referrals. Mirrors the iOS call
 * site bonayd-ios/.../Utils/ReferralAPIService.swift:266 (`fetchReferrals`) —
 * GET /users/me/referrals. Browser calls go through `/api/proxy/*`. A **404 means
 * "nothing invited yet"** and folds to an empty list (the empty state), not an error.
 */
export async function getReferrals(): Promise<ReferralList> {
  try {
    return await apiClient.get<ReferralList>(API_ENDPOINTS.USERS.REFERRALS);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { invitations: [], referrals: [] };
    throw err;
  }
}

export function useReferrals() {
  return useQuery({
    queryKey: referralsQueryKey(),
    queryFn: getReferrals,
    staleTime: 1000 * 30,
  });
}
