import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { unwrapChangeRequests } from '../lib/change-request-normalize';
import type { ChangeRequest } from '../schemas/change-request';

export const changeRequestThreadQueryKey = (changeRequestId: number) =>
  ['change-requests', 'thread', changeRequestId] as const;

/**
 * The full negotiation chain for one change request (the parent + every
 * counter-offer child). GET /change-requests/:id/thread. Verified as a bare array
 * on dev (a parentless request returns just itself); the iOS `{ thread }`
 * envelope is tolerated.
 */
export async function getChangeRequestThread(changeRequestId: number): Promise<ChangeRequest[]> {
  const path = API_ENDPOINTS.CHANGE_REQUESTS.THREAD.replace(':id', String(changeRequestId));
  const data = await apiClient.get<unknown>(path);
  return unwrapChangeRequests(data, 'thread', 'changeRequests');
}

export function useChangeRequestThread(changeRequestId: number | null) {
  return useQuery({
    queryKey: changeRequestThreadQueryKey(changeRequestId ?? 0),
    queryFn: () => getChangeRequestThread(changeRequestId as number),
    enabled: changeRequestId !== null && Number.isFinite(changeRequestId),
    staleTime: 1000 * 15,
  });
}
