import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import type { ReferralStats } from '../types/referral';

export const referralStatsQueryKey = () => ['referral', 'stats'] as const;

/**
 * The signed-in user's refer-a-friend funnel + reward progress. Mirrors the iOS call
 * site bonayd-ios/.../Utils/ReferralAPIService.swift:254 (`fetchStats`) —
 * GET /users/me/referrals/stats. Browser calls go through `/api/proxy/*`, which
 * attaches the session token. A **404 means "no referral activity yet"** and folds
 * to an empty stats object (zeroed counters, no tier) rather than an error.
 */
export async function getReferralStats(): Promise<ReferralStats> {
  try {
    return await apiClient.get<ReferralStats>(API_ENDPOINTS.USERS.REFERRAL_STATS);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return {};
    throw err;
  }
}

export function useReferralStats() {
  return useQuery({
    queryKey: referralStatsQueryKey(),
    queryFn: getReferralStats,
    staleTime: 1000 * 30,
  });
}
