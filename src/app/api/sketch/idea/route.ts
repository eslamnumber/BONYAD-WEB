import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/**
 * Create a 2D→3D sketch job. Forwards the browser's `POST /api/sketch/idea` to the
 * Cloud Run host `POST /api/sketch/idea` (CSP `connect-src 'self'` forbids the browser
 * reaching the foreign host directly). The session token is attached server-side as a
 * Bearer when present (the sketch backend ignores it, but mirrors the AI routes). The
 * `{ jobId, status }` reply is forwarded verbatim. Mirrors iOS `SketchPlannerAPI.createJob`.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => undefined);
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  try {
    const data = await apiClient.post<unknown>(API_ENDPOINTS.SKETCH.IDEA, {
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
