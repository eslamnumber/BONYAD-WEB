import { useQuery } from '@tanstack/react-query';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

export const aiHealthQueryKey = () => ['ai', 'health'] as const;

/**
 * Is the Omdah chatbot reachable? Polls the same-origin `/api/ai/health` route,
 * which forwards to the Cloud Run `/health`. Mirrors iOS `checkHealth` — an offline
 * chatbot blocks generation, so the flow shows the offline state. Never throws:
 * the route maps any failure to `{ status: 'down' }`.
 */
export async function checkAiHealth(): Promise<boolean> {
  const data = await apiClient.get<{ status?: string }>(AI_INTERNAL_ROUTES.HEALTH, {
    internal: true,
  });
  return data?.status === 'ok';
}

export function useAiHealth() {
  return useQuery({
    queryKey: aiHealthQueryKey(),
    queryFn: checkAiHealth,
    staleTime: 1000 * 30,
    retry: 1,
  });
}
