import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';
import { getActiveBackendBaseUrl } from '@/lib/api-environment.server';
import { setSessionCookie } from '@/lib/session-cookie';

const bodySchema = z.object({
  userId: z.number().int().positive(),
  otpCode: z.string().regex(/^\d{4}$/),
});

/** Backend `change-phone-verify` response — `{ user, token, message }`. */
type VerifyResponse = { user?: { phoneNumber?: string; name?: string }; token?: string };

function jsonError(body: unknown, status: number): NextResponse {
  return NextResponse.json(body ?? null, { status });
}

/**
 * Verify a phone-change OTP server-side and re-mint the session cookie. The
 * current session token (from the httpOnly cookie) authorises the backend call;
 * the backend returns a **rotated** JWT (the old one is invalidated because the
 * phone is a JWT claim), which becomes the new cookie — the browser can't write an
 * httpOnly cookie itself. Returns the updated user for the auth store. Mirrors the
 * iOS flow in MyProfile.swift:1263.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return jsonError({ messageEn: 'Invalid request.', errorCode: 'BAD_REQUEST' }, 400);
  }

  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return jsonError({ errorCode: 'UNAUTHENTICATED' }, 401);

  let data: VerifyResponse;
  try {
    const baseUrl = await getActiveBackendBaseUrl();
    data = await apiClient.post<VerifyResponse>(
      API_ENDPOINTS.USERS.CHANGE_PHONE_VERIFY.replace(':userId', String(body.userId)),
      { body: { otpCode: body.otpCode }, token, baseUrl },
    );
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    return jsonError(err.body, err.status);
  }

  if (data.token) await setSessionCookie(data.token);
  return NextResponse.json({ user: data.user ?? null });
}
