import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME } from '@/config/constants';
import { isDevelopment } from '@/config/env';

/** 7 days — matches the backend JWT lifetime expectation on the RN app. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Set the httpOnly session cookie to `token`. Used by `/api/auth/login` and by
 * `/api/auth/change-phone-verify` (which re-mints the cookie after the backend
 * rotates the JWT). The JWT never reaches browser JS.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}
