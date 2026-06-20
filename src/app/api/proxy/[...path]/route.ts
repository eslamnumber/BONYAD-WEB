import { NextResponse, type NextRequest } from 'next/server';

import { API_ENV_COOKIE_NAME, AUTH_COOKIE_NAME } from '@/config/constants';
import { ApiError, apiClient } from '@/lib/api-client';
import { resolveBackendBaseUrl } from '@/lib/backend';

/**
 * Authenticated backend proxy. The browser cannot hit the cross-origin backend
 * directly (CSP `connect-src 'self'`), so `apiClient` routes every call through
 * `/api/proxy/<path>`. Here we attach the httpOnly session token server-side and
 * forward to the backend. A 401 clears the (now-invalid) session cookie.
 */

type Ctx = { params: Promise<{ path: string[] }> };
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type ForwardOpts = { token: string | undefined; body: unknown; baseUrl: string };

async function callBackend(
  method: Method,
  endpoint: string,
  { token, body, baseUrl }: ForwardOpts,
): Promise<unknown> {
  switch (method) {
    case 'get':
      return apiClient.get(endpoint, { token, baseUrl });
    case 'delete':
      return apiClient.delete(endpoint, { token, baseUrl });
    case 'post':
      return apiClient.post(endpoint, { token, body, baseUrl });
    case 'put':
      return apiClient.put(endpoint, { token, body, baseUrl });
    case 'patch':
      return apiClient.patch(endpoint, { token, body, baseUrl });
  }
}

/** Read the session token + selected backend host from the request cookies. */
function readRequestEnv(req: NextRequest): { token: string | undefined; baseUrl: string } {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const baseUrl = resolveBackendBaseUrl(req.cookies.get(API_ENV_COOKIE_NAME)?.value);
  return { token, baseUrl };
}

/**
 * Read the forwardable body, preserving its wire format so `apiClient` re-sends it
 * to the backend with the matching Content-Type:
 *   - `multipart/form-data` (chat send-with-file) → FormData, re-streamed with a
 *     fresh boundary.
 *   - `application/x-www-form-urlencoded` (POST /signatures, contract PDF gen) →
 *     URLSearchParams, passed through untouched. Reading these as JSON would throw
 *     and silently drop the body — the backend then answers "Required request body
 *     is missing" (its `@RequestBody` binds to null).
 *   - everything else → JSON.
 */
async function readBody(method: Method, req: NextRequest): Promise<unknown> {
  if (method !== 'post' && method !== 'put' && method !== 'patch') return undefined;
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return req.formData().catch(() => undefined);
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text().catch(() => '');
    return text ? new URLSearchParams(text) : undefined;
  }
  return req.json().catch(() => undefined);
}

async function forward(method: Method, req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const endpoint = `/${path.join('/')}${req.nextUrl.search}`;
  const { token, baseUrl } = readRequestEnv(req);
  const body = await readBody(method, req);

  try {
    const data = await callBackend(method, endpoint, { token, body, baseUrl });
    return NextResponse.json(data ?? null);
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    const res = NextResponse.json(err.body ?? null, { status: err.status });
    if (err.status === 401) res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }
}

export const GET = (req: NextRequest, ctx: Ctx) => forward('get', req, ctx);
export const POST = (req: NextRequest, ctx: Ctx) => forward('post', req, ctx);
export const PUT = (req: NextRequest, ctx: Ctx) => forward('put', req, ctx);
export const PATCH = (req: NextRequest, ctx: Ctx) => forward('patch', req, ctx);
export const DELETE = (req: NextRequest, ctx: Ctx) => forward('delete', req, ctx);
