import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { projectQueryKey } from './get-project';
import { projectBidsQueryKey } from './get-project-bids';

/**
 * Reject a technician's bid on a project. Mirrors the iOS call site
 * bonayd-ios/.../App/Utils/SupervisorActionsService.swift (`rejectBid`) — POST
 * /bids/:id/reject with an empty body. Used by an ACTIVE project supervisor managing
 * the project's bids (the customer-facing accept flow lives in {@link acceptBid}).
 * Verified live on the dev backend (the route exists; a missing bid 400s with a plain
 * `{ error }` body). Browser calls go through `/api/proxy/*`, which attaches the token.
 */
export async function rejectBid(bidId: number): Promise<void> {
  await apiClient.post<unknown>(API_ENDPOINTS.BIDS.REJECT.replace(':id', String(bidId)));
}

/**
 * Reject a bid, then refresh the project + its bids list (the rejected bid drops to
 * REJECTED) and the supervision queries (the audit log gains a row).
 */
export function useRejectBid(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: rejectBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectBidsQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ['supervision'] });
    },
  });
}
