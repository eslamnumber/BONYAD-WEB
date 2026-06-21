import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { isBenignAgreeError } from '../lib/change-request-status';
import type { ChangeRequestAgreementResponse } from '../schemas/change-request';
import {
  type AgreeChangeRequestInput,
  agreeChangeRequestSchema,
} from '../schemas/change-request-form';

import { invalidateChangeRequests } from './invalidate-change-requests';

export type AgreeChangeRequestVars = {
  projectId: number;
  changeRequestId: number;
  input?: AgreeChangeRequestInput;
};

/**
 * Agree to a change request — per party. POST /change-requests/:id/agree. Each
 * side calls this once; only when the response's `bothAgreed` is true does the
 * change lock in (signed `documentUrl` produced, phases rewritten). `signingMethod`
 * defaults to "EMAIL" (the only value the backend supports). Body zod-validated.
 */
export async function agreeChangeRequest({
  changeRequestId,
  input,
}: AgreeChangeRequestVars): Promise<ChangeRequestAgreementResponse> {
  const body = agreeChangeRequestSchema.parse(input ?? {});
  const path = API_ENDPOINTS.CHANGE_REQUESTS.AGREE.replace(':id', String(changeRequestId));
  return apiClient.post<ChangeRequestAgreementResponse>(path, { body });
}

export function useAgreeChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agreeChangeRequest,
    onSuccess: (_data, { projectId, changeRequestId }) =>
      invalidateChangeRequests(queryClient, projectId, changeRequestId),
    onError: (error, { projectId, changeRequestId }) => {
      // A benign agree error (already-agreed, or the bothAgreed "not a technician"
      // quirk) means the backend is ahead of our cached flags — resync them.
      if (isBenignAgreeError(error)) {
        invalidateChangeRequests(queryClient, projectId, changeRequestId);
      }
    },
  });
}
