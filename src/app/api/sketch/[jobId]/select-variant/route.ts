import { NextResponse, type NextRequest } from 'next/server';

import { AI_HOSTS } from '@/config/ai-hosts';
import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

type Ctx = { params: Promise<{ jobId: string }> };

/**
 * Pin the chosen 2D variant. Forwards `POST /api/sketch/:jobId/select-variant`
 * (`{ variant_index }`) to the Cloud Run host; returns the updated SPJob whose
 * `active_variant` + `parse` now reflect the selection. Mirrors iOS `selectVariant`.
 */
export async function POST(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { jobId } = await ctx.params;
  const body = await req.json().catch(() => undefined);
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  try {
    const path = API_ENDPOINTS.SKETCH.SELECT_VARIANT.replace(':jobId', encodeURIComponent(jobId));
    const data = await apiClient.post<unknown>(path, { body, token, baseUrl: AI_HOSTS.chatbot });
    return NextResponse.json(data ?? null);
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return NextResponse.json(err.body ?? null, { status: err.status });
  }
}
