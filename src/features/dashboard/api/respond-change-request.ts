import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ChangeRequestResponse } from '../schemas/change-request';
import {
  type RespondChangeRequestInput,
  respondChangeRequestSchema,
} from '../schemas/change-request-form';

import { invalidateChangeRequests } from './invalidate-change-requests';

export type RespondChangeRequestVars = {
  projectId: number;
  changeRequestId: number;
  input: RespondChangeRequestInput;
};

/**
 * Post a counter-offer reply on a change request. POST
 * /change-requests/:id/respond. The reply becomes a child of the parent and the
 * thread grows; the request moves PENDING → RESPONDED. Body zod-validated.
 */
export async function respondChangeRequest({
  changeRequestId,
  input,
}: RespondChangeRequestVars): Promise<ChangeRequestResponse> {
  const body = respondChangeRequestSchema.parse(input);
  const path = API_ENDPOINTS.CHANGE_REQUESTS.RESPOND.replace(':id', String(changeRequestId));
  return apiClient.post<ChangeRequestResponse>(path, { body });
}

export function useRespondChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respondChangeRequest,
    onSuccess: (_data, { projectId, changeRequestId }) =>
      invalidateChangeRequests(queryClient, projectId, changeRequestId),
  });
}
