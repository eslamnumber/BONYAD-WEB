import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/** Refine must never be cached — a stale SOW echoed back is a critical bug. */
export const dynamic = 'force-dynamic';

/**
 * Natural-language SOW refine. Forwards the browser's `POST /api/ai/refine` to the
 * AWS refine service `POST /api/project/refine/await`, which applies the edit to
 * the full SOW and returns `{ sow, response }`. Mirrors iOS `SOWRefineService.refine`
 * (its own cache-disabled session). The `no-store` headers below mirror that intent.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => undefined);
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  try {
    const data = await apiClient.post<unknown>(API_ENDPOINTS.AI.REFINE, {
      body,
      token,
      baseUrl: AI_HOSTS.refine,
    });
    return NextResponse.json(data ?? null, {
      headers: { 'Cache-Control': 'no-store, no-cache' },
    });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return NextResponse.json(err.body ?? null, { status: err.status });
  }
}
