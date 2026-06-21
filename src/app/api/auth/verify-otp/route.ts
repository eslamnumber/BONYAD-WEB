import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { API_ENDPOINTS } from '@/config/endpoints';
import { approveTerms } from '@/features/auth';
import { ApiError, apiClient } from '@/lib/api-client';
import { getActiveBackendBaseUrl } from '@/lib/api-environment.server';
import { setSessionCookie } from '@/lib/session-cookie';

const bodySchema = z.object({
  phoneNumber: z.string().min(1),
  otpCode: z.string().regex(/^\d{4}$/),
  role: z.enum(['USER', 'TECHNICIAN']),
  /** Terms version the user agreed to on the signup screen; absent ⇒ nothing to pin. */
  termsId: z.number().int().positive().optional(),
});

/** Backend `verify-otp` response — issues a session token on success. */
type VerifyResponse = { token?: string; message?: string };

function jsonError(body: unknown, status: number): NextResponse {
  return NextResponse.json(body ?? null, { status });
}

/**
 * Verify a registration OTP server-side. On success the backend issues a session
 * token; we use it ONCE — server-side — to record the Terms agreement
 * (`POST /users/terms/approve`), mirroring the iOS post-OTP `approveTerms` call,
 * then **establish the session** via {@link setSessionCookie} so the user is logged
 * in immediately (mirrors the login route handler). The JWT never reaches browser JS.
 * Terms recording is best-effort and non-blocking; cookie establishment is required
 * — without it the auth guard bounces the user back to /login and the "success"
 * the form just showed is lost. Returns `{ message, role }` so the client can
 * navigate based on role (TECHNICIAN → /complete-profile, USER → /dashboard).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return jsonError({ messageEn: 'Invalid request.', errorCode: 'BAD_REQUEST' }, 400);
  }

  const baseUrl = await getActiveBackendBaseUrl();

  let data: VerifyResponse;
  try {
    data = await apiClient.post<VerifyResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      body: { phoneNumber: body.phoneNumber, otpCode: body.otpCode, role: body.role },
      baseUrl,
    });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return jsonError(err.body, err.status);
  }

  if (data.token && body.termsId) {
    await approveTerms(body.termsId, data.token, baseUrl).catch(() => undefined);
  }

  // Establish the session — the user just verified their phone, they should be
  // logged in immediately (same as the login route handler). Without this the
  // onboarding guard redirects them to /login and the "success" is lost.
  if (data.token) {
    await setSessionCookie(data.token);
  }

  return NextResponse.json({ message: data.message, role: body.role });
}
