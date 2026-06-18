import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { supportQueryKey } from '../lib/support-format';
import { type SupportRequest, type SupportRequestListBody } from '../schemas/support';

function byNewest(a: SupportRequest, b: SupportRequest): number {
  return (b.requestedAt ?? '').localeCompare(a.requestedAt ?? '');
}

/**
 * The signed-in user's support requests, newest first. Mirrors the iOS call site
 * bonayd-ios/.../Utils/SupportRequestService.swift:390 (`getMyRequests`) — GET
 * /support/my-requests. Browser calls go through `/api/proxy/*`, which attaches the
 * session token. Permissive: tolerates a bare array or a `{ requests }` / `{ data }`
 * envelope (rule 1).
 */
export async function getSupportRequests(): Promise<SupportRequest[]> {
  const data = await apiClient.get<SupportRequestListBody>(API_ENDPOINTS.SUPPORT.MY_REQUESTS);
  const list = Array.isArray(data) ? data : (data.requests ?? data.data ?? []);
  return [...list].sort(byNewest);
}

export function useSupportRequests() {
  return useQuery({
    queryKey: supportQueryKey(),
    queryFn: getSupportRequests,
    staleTime: 1000 * 30,
  });
}
