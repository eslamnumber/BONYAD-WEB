import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  createBidRequestSchema,
  type CreateBidRequest,
  type CreateBidResponse,
} from '../schemas/bid';

import { deleteBid } from './delete-bid';
import { projectQueryKey } from './get-project';
import { projectBidsQueryKey } from './get-project-bids';

/**
 * Submit a bid/offer on a project. Mirrors the RN call site
 * website-bonyad/src/screens/bids/BidFormModal.tsx — POST /bids/create. The body
 * is validated against the strict {@link createBidRequestSchema} before sending
 * (hard rule 1). Browser calls go through `/api/proxy/*`, which attaches the
 * session token.
 */
export async function createBid(input: CreateBidRequest): Promise<CreateBidResponse> {
  const body = createBidRequestSchema.parse(input);
  return apiClient.post<CreateBidResponse>(API_ENDPOINTS.BIDS.CREATE, { body });
}

/** A submit (create), optionally replacing an existing bid first (the "edit" path). */
export type SubmitBidVars = { request: CreateBidRequest; replaceBidId?: number };

/**
 * Submit (or re-submit) a bid. The backend allows one bid per project and has no
 * update verb, so editing is delete-then-create: when `replaceBidId` is set the
 * old bid is withdrawn before the new one is posted (mirrors the RN
 * withdraw→re-bid path). Invalidates both the project and its bids list.
 */
export function useSubmitBid() {
  const queryClient = useQueryClient();
  return useMutation<CreateBidResponse, Error, SubmitBidVars>({
    mutationFn: async ({ request, replaceBidId }) => {
      if (replaceBidId !== undefined) await deleteBid(replaceBidId);
      return createBid(request);
    },
    onSuccess: (_data, { request }) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKey(request.projectId) });
      queryClient.invalidateQueries({ queryKey: projectBidsQueryKey(request.projectId) });
    },
  });
}
