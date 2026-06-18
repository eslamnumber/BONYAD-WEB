import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { feedbackQueryKey } from '../lib/feedback-format';
import { type AppFeedback, type AppFeedbackListBody } from '../schemas/feedback';

function byNewest(a: AppFeedback, b: AppFeedback): number {
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
}

/**
 * The signed-in user's feedback, newest first → GET /app-feedback/mine. Browser calls go
 * through `/api/proxy/*`, which attaches the session token. Permissive: tolerates a bare
 * array or a `{ feedback }` / `{ data }` envelope (rule 1).
 */
export async function getMyFeedback(): Promise<AppFeedback[]> {
  const data = await apiClient.get<AppFeedbackListBody>(API_ENDPOINTS.APP_FEEDBACK.MINE);
  const list = Array.isArray(data) ? data : (data.feedback ?? data.data ?? []);
  return [...list].sort(byNewest);
}

export function useMyFeedback() {
  return useQuery({
    queryKey: feedbackQueryKey(),
    queryFn: getMyFeedback,
    staleTime: 1000 * 30,
  });
}
