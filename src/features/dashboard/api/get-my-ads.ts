import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Ad } from '../schemas/ad';

export const myAdsQueryKey = () => ['ads', 'mine'] as const;

/** Pull the `Ad[]` out of the `{ ads }` envelope; tolerate a bare array too.
 *  Shared with the customer-facing feed fetcher (`get-ads-feed`). */
export function extractAds(data: unknown): Ad[] {
  if (Array.isArray(data)) return data as Ad[];
  if (data && typeof data === 'object') {
    const ads = (data as { ads?: Ad[] }).ads;
    if (Array.isArray(ads)) return ads;
  }
  return [];
}

/**
 * The signed-in technician's own advertisements — GET /ads/mine. Verified live on the
 * dev backend (technician 444): `{ ads: Ad[] }`, each carrying `status` +
 * `impressions`/`clicks`/`ctr` + the `service*` fields. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function getMyAds(): Promise<Ad[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.ADS.MINE);
  return extractAds(data);
}

export function useMyAds() {
  return useQuery({ queryKey: myAdsQueryKey(), queryFn: getMyAds, staleTime: 1000 * 30 });
}
