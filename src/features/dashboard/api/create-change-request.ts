import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ChangeRequestResponse } from '../schemas/change-request';
import {
  type CreateChangeRequestInput,
  createChangeRequestSchema,
} from '../schemas/change-request-form';

import { invalidateChangeRequests } from './invalidate-change-requests';

export type CreateChangeRequestVars = { projectId: number; input: CreateChangeRequestInput };

/**
 * Open a change request on a project. POST
 * /change-requests/project/:projectId/request. The body is zod-validated (CLAUDE
 * rule 1); the response is the permissive {@link ChangeRequestResponse}. Mirrors
 * the iOS `ChangeRequestService.requestChange`.
 */
export async function createChangeRequest({
  projectId,
  input,
}: CreateChangeRequestVars): Promise<ChangeRequestResponse> {
  const body = createChangeRequestSchema.parse(input);
  const path = API_ENDPOINTS.CHANGE_REQUESTS.CREATE.replace(':projectId', String(projectId));
  return apiClient.post<ChangeRequestResponse>(path, { body });
}

export function useCreateChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChangeRequest,
    onSuccess: (_data, { projectId }) => invalidateChangeRequests(queryClient, projectId),
  });
}
