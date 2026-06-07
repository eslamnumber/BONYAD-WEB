import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';
import { getActiveBackendBaseUrl } from '@/lib/api-environment.server';

/**
 * Clear the httpOnly session cookie and best-effort notify the backend. The
 * web session ends regardless of the backend call's outcome.
 */
export async function POST(): Promise<NextResponse> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  store.delete(AUTH_COOKIE_NAME);

  if (token) {
    const baseUrl = await getActiveBackendBaseUrl();
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { token, baseUrl }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
