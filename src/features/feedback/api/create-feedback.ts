import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { feedbackQueryKey } from '../lib/feedback-format';
import {
  type AppFeedback,
  createFeedbackSchema,
  type FeedbackFormValues,
} from '../schemas/feedback';

/**
 * Submit in-app feedback → POST /app-feedback. `subject` is sent as `null` when blank and
 * `attachments` is omitted entirely (upload UI not wired yet). Strict request body (rule 1);
 * the created record is read permissively.
 */
export async function createFeedback(values: FeedbackFormValues): Promise<AppFeedback> {
  const subject = values.subject.trim();
  const body = createFeedbackSchema.parse({
    category: values.category,
    subject: subject.length > 0 ? subject : null,
    message: values.message.trim(),
  });
  return apiClient.post<AppFeedback>(API_ENDPOINTS.APP_FEEDBACK.SUBMIT, { body });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation<AppFeedback, Error, FeedbackFormValues>({
    mutationFn: createFeedback,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedbackQueryKey() }),
  });
}
