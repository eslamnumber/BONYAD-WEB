import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Ad } from '../schemas/ad';

import { extractAds } from './get-my-ads';

export const adsFeedQueryKey = () => ['ads', 'feed'] as const;

/**
 * The customer-facing advertisements feed — GET /ads/feed. Powers the customer
 * dashboard "Explore offers" (استكشف العروض) section. Same `{ ads: Ad[] }` envelope
 * as /ads/mine (verified live on the dev backend; see config/endpoints.ts ADS), so
 * it reuses {@link extractAds} and the shared {@link Ad} type. Browser calls go
 * through `/api/proxy/*`, which attaches the session token.
 */
export async function getAdsFeed(): Promise<Ad[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.ADS.FEED);
  return extractAds(data);
}

export function useAdsFeed() {
  return useQuery({ queryKey: adsFeedQueryKey(), queryFn: getAdsFeed, staleTime: 1000 * 60 });
}
