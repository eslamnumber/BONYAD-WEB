import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { isDevelopment } from '@/config/env';
import {
  PENDING_VERIFICATION_CODE,
  loginRequestSchema,
  toLoginResult,
  type LoginResponse,
} from '@/features/auth';
import { ApiError, apiClient } from '@/lib/api-client';
import { getActiveBackendBaseUrl } from '@/lib/api-environment.server';

/** 7 days — matches the backend JWT lifetime expectation on the RN app. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

function jsonError(body: unknown, status: number): NextResponse {
  return NextResponse.json(body ?? null, { status });
}

/**
 * Server-side login: validate the body, call the backend, set the httpOnly
 * session cookie on success, and return a token-less {@link LoginResult}. The
 * JWT never reaches browser JS. Errors forward the backend's localised envelope.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: ReturnType<typeof loginRequestSchema.parse>;
  try {
    body = loginRequestSchema.parse(await req.json());
  } catch {
    return jsonError({ messageEn: 'Invalid request.', errorCode: 'BAD_REQUEST' }, 400);
  }

  let data: LoginResponse;
  try {
    const baseUrl = await getActiveBackendBaseUrl();
    data = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { body, baseUrl });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    if (err.errorCode === PENDING_VERIFICATION_CODE) {
      return NextResponse.json({ kind: 'pending', phoneNumber: body.phoneNumber, role: body.role });
    }
    return jsonError(err.body, err.status);
  }

  try {
    const result = toLoginResult(data, body.role, body.phoneNumber);
    if (result.kind === 'success' && data.token) await setSessionCookie(data.token);
    return NextResponse.json(result);
  } catch (err) {
    // toLoginResult throws on an unexpected 200 body (no token, no pending message).
    if (err instanceof ApiError) return jsonError({ errorCode: 'UNEXPECTED_RESPONSE' }, 502);
    throw err;
  }
}
