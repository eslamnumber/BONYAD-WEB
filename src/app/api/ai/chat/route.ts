import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/**
 * Conversational wizard step (REST). Forwards the browser's `POST /api/ai/chat`
 * to the Cloud Run chatbot `POST /api/chat`. The session token is attached
 * server-side as a Bearer when present (iOS `includeAuth`) — the chatbot does not
 * require it for the gather/plan steps but reads it on the publish-finalize step.
 * The chatbot's response (`{ response, conversationId, ui }`) is forwarded verbatim.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => undefined);
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  try {
    const data = await apiClient.post<unknown>(API_ENDPOINTS.AI.CHAT, {
      body,
      token,
      baseUrl: AI_HOSTS.chatbot,
    });
    return NextResponse.json(data ?? null);
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return NextResponse.json(err.body ?? null, { status: err.status });
  }
}
