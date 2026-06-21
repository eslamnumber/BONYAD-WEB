import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/** Never statically cached — every poll must hit the live job snapshot. */
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ jobId: string }> };

/**
 * Poll the SPJob snapshot. Forwards `GET /api/sketch/:jobId` to the Cloud Run host
 * with a `?t=<ms>` cache-bust (iOS `SketchNoCacheSession` parity) and returns the
 * job verbatim with `Cache-Control: no-store` so the browser never serves a stale
 * variant/scene. The client polls this every 1.5 s until `status` is terminal.
 */
export async function GET(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { jobId } = await ctx.params;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  try {
    const path = API_ENDPOINTS.SKETCH.GET_JOB.replace(':jobId', encodeURIComponent(jobId));
    const data = await apiClient.get<unknown>(path, {
      token,
      baseUrl: AI_HOSTS.chatbot,
      params: { t: Date.now() },
    });
    return NextResponse.json(data ?? null, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return NextResponse.json(err.body ?? null, { status: err.status });
  }
}
