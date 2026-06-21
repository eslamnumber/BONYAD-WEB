import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { unwrapChangeRequests } from '../lib/change-request-normalize';
import type { ChangeRequest } from '../schemas/change-request';

export const changeRequestsQueryKey = (projectId: number) =>
  ['change-requests', 'list', projectId] as const;

/**
 * Every change request for a project, including resolved history. GET
 * /change-requests/project/:projectId. Verified as a bare array on dev (records
 * 12, 13); the iOS `{ changeRequests }` / `{ requests }` envelopes are tolerated.
 */
export async function getChangeRequests(projectId: number): Promise<ChangeRequest[]> {
  const path = API_ENDPOINTS.CHANGE_REQUESTS.LIST.replace(':projectId', String(projectId));
  const data = await apiClient.get<unknown>(path);
  return unwrapChangeRequests(data, 'changeRequests', 'requests');
}

export function useChangeRequests(projectId: number, enabled = true) {
  return useQuery({
    queryKey: changeRequestsQueryKey(projectId),
    queryFn: () => getChangeRequests(projectId),
    enabled: enabled && Number.isFinite(projectId),
    staleTime: 1000 * 30,
  });
}
