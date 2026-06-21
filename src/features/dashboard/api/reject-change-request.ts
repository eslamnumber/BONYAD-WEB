import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ChangeRequestResponse } from '../schemas/change-request';
import {
  type RejectChangeRequestInput,
  rejectChangeRequestSchema,
} from '../schemas/change-request-form';

import { invalidateChangeRequests } from './invalidate-change-requests';

export type RejectChangeRequestVars = {
  projectId: number;
  changeRequestId: number;
  input?: RejectChangeRequestInput;
};

/**
 * Reject a change request, ending the negotiation. POST /change-requests/:id/reject.
 * Either party may reject. Optional `reason`. Body zod-validated.
 */
export async function rejectChangeRequest({
  changeRequestId,
  input,
}: RejectChangeRequestVars): Promise<ChangeRequestResponse> {
  const body = rejectChangeRequestSchema.parse(input ?? {});
  const path = API_ENDPOINTS.CHANGE_REQUESTS.REJECT.replace(':id', String(changeRequestId));
  return apiClient.post<ChangeRequestResponse>(path, { body });
}

export function useRejectChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectChangeRequest,
    onSuccess: (_data, { projectId, changeRequestId }) =>
      invalidateChangeRequests(queryClient, projectId, changeRequestId),
  });
}
