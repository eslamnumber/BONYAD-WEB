import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  createBidRequestSchema,
  type CreateBidRequest,
  type CreateBidResponse,
} from '../schemas/bid';

import { projectQueryKey } from './get-project';

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

export function useCreateBid() {
  const queryClient = useQueryClient();
  return useMutation<CreateBidResponse, Error, CreateBidRequest>({
    mutationFn: createBid,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKey(variables.projectId) });
    },
  });
}
