import { type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/** SSE passthrough — never cache or buffer the stream. */
export const dynamic = 'force-dynamic';

/**
 * SOW generation stream (SSE passthrough). Forwards the browser's
 * `POST /api/ai/chat/stream` to the Cloud Run chatbot `POST /api/chat/stream`
 * and pipes the `text/event-stream` body straight back, unbuffered, so the
 * client hook can render sections as they arrive. On an upstream error the client
 * falls back to the REST `/api/ai/chat` path, so we surface the status and let it retry.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json().catch(() => undefined);
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  try {
    const upstream = await apiClient.stream(API_ENDPOINTS.AI.CHAT_STREAM, {
      body,
      token,
      baseUrl: AI_HOSTS.chatbot,
      signal: req.signal,
    });
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 502;
    return new Response(null, { status });
  }
}
