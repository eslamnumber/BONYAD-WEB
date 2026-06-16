import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Region } from '../schemas/region';

export const regionsQueryKey = () => ['regions'] as const;

/**
 * All service regions for the create-project location picker. Mirrors the RN call
 * site website-bonyad/src/utils/searchService.ts:108 (`getCachedRegions`) —
 * GET /regions. The backend returns an untyped array; a page envelope is
 * unwrapped and an unexpected shape yields []. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function getRegions(): Promise<Region[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.ZONES.LIST);
  return extractRegions(data);
}

function extractRegions(data: unknown): Region[] {
  if (Array.isArray(data)) return data as Region[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) return content as Region[];
  }
  return [];
}

/** Regions are global + slow-changing, so cache for 30 minutes. */
export function useRegions() {
  return useQuery({
    queryKey: regionsQueryKey(),
    queryFn: getRegions,
    staleTime: 1000 * 60 * 30,
  });
}
