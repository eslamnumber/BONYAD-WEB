import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/** A service region/zone (GET /regions). Permissive — only `id` is guaranteed. */
export type Region = { id: number; nameEn?: string; nameAr?: string };

/** Shared with the create-project picker via the same key, so the list is fetched once. */
export const regionsQueryKey = () => ['regions'] as const;

function extractRegions(data: unknown): Region[] {
  if (Array.isArray(data)) return data as Region[];
  if (data && typeof data === 'object') {
    const obj = data as { content?: unknown; data?: unknown };
    if (Array.isArray(obj.content)) return obj.content as Region[];
    if (Array.isArray(obj.data)) return obj.data as Region[];
  }
  return [];
}

/**
 * All service regions for the Edit-profile zone picker. Mirrors the iOS call site
 * MyProfile.swift:580 (`fetchZones`) — GET /regions (a `{ data }` / `{ content }`
 * envelope or a bare array is unwrapped; an unexpected shape yields `[]`). Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getRegions(): Promise<Region[]> {
  return extractRegions(await apiClient.get<unknown>(API_ENDPOINTS.ZONES.LIST));
}

/** Regions are global + slow-changing, so cache for 30 minutes. */
export function useRegions() {
  return useQuery({ queryKey: regionsQueryKey(), queryFn: getRegions, staleTime: 1000 * 60 * 30 });
}
