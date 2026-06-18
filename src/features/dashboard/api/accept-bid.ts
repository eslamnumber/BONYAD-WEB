import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { projectQueryKey } from './get-project';
import { projectBidsQueryKey } from './get-project-bids';

/**
 * Accept a technician's bid on a project. Mirrors the RN call site
 * website-bonyad/src/screens/bids/AcceptBidModal.tsx:69 — POST /bids/:id/accept
 * with an empty body. Accepting moves the project into the approved phase. Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function acceptBid(bidId: number): Promise<void> {
  await apiClient.post<unknown>(API_ENDPOINTS.BIDS.ACCEPT.replace(':id', String(bidId)));
}

/**
 * Accept a bid, then refresh the project (its status moves to the approved phase,
 * which re-routes the detail screen) and its bids list.
 */
export function useAcceptBid(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: acceptBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectBidsQueryKey(projectId) });
      // Acceptance moves the project from bid-phase (/bids/my) into assigned work
      // (/projects/my-assigned) for the technician — refresh both list namespaces.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['bids'] });
    },
  });
}
