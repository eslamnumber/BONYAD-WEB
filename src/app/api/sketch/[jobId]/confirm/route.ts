import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

/** The 2D→3D build is slow (~60s); keep the route dynamic and let it run long. */
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type Ctx = { params: Promise<{ jobId: string }> };

/**
 * Build the 3D scene. Forwards `POST /api/sketch/:jobId/confirm` (empty body) to the
 * Cloud Run host — the slow 2D→3D conversion call — and returns the SPJob with
 * `scene` (`rooms / openings / placements / wall_height_m / wall_thickness_m`)
 * populated and `status: ready`. Mirrors iOS `confirmScene`.
 */
export async function POST(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { jobId } = await ctx.params;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  try {
    const path = API_ENDPOINTS.SKETCH.CONFIRM.replace(':jobId', encodeURIComponent(jobId));
    const data = await apiClient.post<unknown>(path, { token, baseUrl: AI_HOSTS.chatbot });
    return NextResponse.json(data ?? null);
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return NextResponse.json(err.body ?? null, { status: err.status });
  }
}
