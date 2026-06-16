import { cookies } from 'next/headers';
import { cache } from 'react';

import { AUTH_COOKIE_NAME } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';
import { getActiveBackendBaseUrl } from '@/lib/api-environment.server';
import { toAuthUser, validateTokenRequestSchema, type ValidateTokenResponse } from '@/lib/session';
import type { AuthUser } from '@/types/auth';

/**
 * Server-only session helpers. Read the httpOnly cookie via `next/headers`, so
 * they only work inside a request scope (RSC / route handler). Calling these
 * from the browser throws — that's the intended guard.
 */

/** The raw session JWT from the httpOnly cookie, or `undefined` when absent. */
export async function getServerToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value;
}

/**
 * Resolve the current user by validating the cookie token against the backend.
 * Returns `null` when there is no cookie or the token is invalid/expired.
 *
 * Wrapped in React `cache()` so multiple callers in the same request (e.g. the
 * `(app)` layout AND the role-branched dashboard page) share a single
 * validate-token round-trip instead of hitting the backend twice.
 *
 * Does NOT clear the cookie on failure — an RSC cannot mutate cookies during
 * render. The proxy clears it on the next 401; middleware redirects unauthenticated
 * navigations.
 */
export const getServerUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getServerToken();
  if (!token) return null;
  try {
    const body = validateTokenRequestSchema.parse({ token });
    const baseUrl = await getActiveBackendBaseUrl();
    const data = await apiClient.post<ValidateTokenResponse>(API_ENDPOINTS.AUTH.VALIDATE_TOKEN, {
      body,
      baseUrl,
    });
    return toAuthUser(data.user);
  } catch {
    return null;
  }
});
