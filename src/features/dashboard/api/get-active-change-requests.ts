import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { unwrapChangeRequests } from '../lib/change-request-normalize';
import type { ChangeRequest } from '../schemas/change-request';

export const activeChangeRequestsQueryKey = (projectId: number) =>
  ['change-requests', 'active', projectId] as const;

/**
 * Active (PENDING/RESPONDED) change requests for a project — the rows the
 * in-progress screen surfaces as negotiation cards. GET
 * /change-requests/project/:projectId/active. Verified as a bare array on dev;
 * the iOS `{ activeNegotiations }` envelope is tolerated. Browser calls go
 * through `/api/proxy/*`, which attaches the session token.
 */
export async function getActiveChangeRequests(projectId: number): Promise<ChangeRequest[]> {
  const path = API_ENDPOINTS.CHANGE_REQUESTS.ACTIVE.replace(':projectId', String(projectId));
  const data = await apiClient.get<unknown>(path);
  return unwrapChangeRequests(data, 'activeNegotiations', 'changeRequests', 'requests');
}

export function useActiveChangeRequests(projectId: number, enabled = true) {
  return useQuery({
    queryKey: activeChangeRequestsQueryKey(projectId),
    queryFn: () => getActiveChangeRequests(projectId),
    enabled: enabled && Number.isFinite(projectId),
    staleTime: 1000 * 30,
  });
}
