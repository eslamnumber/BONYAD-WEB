import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { supportQueryKey } from '../lib/support-format';
import {
  createSupportRequestSchema,
  type CreateSupportResponseBody,
  type SupportRequestFormValues,
} from '../schemas/support';

/**
 * Open a support request. Mirrors the iOS call site
 * bonayd-ios/.../Utils/SupportRequestService.swift:67 (`requestSupport`) — POST
 * /support/request with `{ subject, description, category, priority }`. The web has no
 * AI chatbot, so the iOS `aiConversationHistory` field is omitted. Strict request body
 * (rule 1); the response is read permissively.
 */
export async function createSupportRequest(
  values: SupportRequestFormValues,
): Promise<CreateSupportResponseBody> {
  const body = createSupportRequestSchema.parse({
    subject: values.subject.trim(),
    description: values.description.trim(),
    category: values.category,
    priority: values.priority,
  });
  return apiClient.post<CreateSupportResponseBody>(API_ENDPOINTS.SUPPORT.REQUEST, { body });
}

export function useCreateSupportRequest() {
  const queryClient = useQueryClient();
  return useMutation<CreateSupportResponseBody, Error, SupportRequestFormValues>({
    mutationFn: createSupportRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supportQueryKey() }),
  });
}
