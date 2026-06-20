import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/**
 * Omdah chatbot health check. The browser cannot reach the Cloud Run chatbot
 * host directly (CSP `connect-src 'self'`), so it polls this same-origin route,
 * which forwards to `GET <chatbot>/health`. Mirrors iOS `ChatbotAPIService.checkHealth`.
 * A non-2xx or transport failure surfaces as `{ status: 'down' }` (HTTP 200) so the
 * client can render the offline state without treating the probe itself as an error.
 */
export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const data = await apiClient.get<{ status?: string }>(API_ENDPOINTS.AI.HEALTH, {
      baseUrl: AI_HOSTS.chatbot,
    });
    return NextResponse.json({ status: data?.status === 'ok' ? 'ok' : 'down' });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ status: 'down' });
    return NextResponse.json({ status: 'down' });
  }
}
