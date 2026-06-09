import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { projectQueryKey } from './get-project';
import { projectBidsQueryKey } from './get-project-bids';

/**
 * Withdraw a bid. Mirrors the RN call site
 * website-bonyad/src/screens/bids/TechnicianBidsView.tsx — DELETE /bids/:id (the
 * only verb the backend implements on this path; PUT/PATCH/POST all 500). Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function deleteBid(id: number): Promise<void> {
  await apiClient.delete<unknown>(API_ENDPOINTS.BIDS.DELETE.replace(':id', String(id)));
}

export function useDeleteBid(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteBid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectBidsQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
    },
  });
}
