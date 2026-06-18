import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import type { ReferralWallet } from '../types/referral';

export const referralWalletQueryKey = () => ['referral', 'wallet'] as const;

/**
 * The signed-in user's reward wallet (SAR credit earned from converted referrals).
 * Mirrors the iOS call site bonayd-ios/.../Utils/ReferralAPIService.swift:278
 * (`fetchWallet`) — GET /users/me/wallet. Browser calls go through `/api/proxy/*`.
 * A **404 means "no wallet yet"** and folds to `null` (the hero renders a 0 balance),
 * never an error.
 */
export async function getReferralWallet(): Promise<ReferralWallet | null> {
  try {
    return await apiClient.get<ReferralWallet>(API_ENDPOINTS.USERS.WALLET);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function useReferralWallet() {
  return useQuery({
    queryKey: referralWalletQueryKey(),
    queryFn: getReferralWallet,
    staleTime: 1000 * 30,
  });
}
