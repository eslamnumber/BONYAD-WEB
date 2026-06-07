import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { apiEnvironmentFromKey } from '@/config/api-environments';
import { API_ENV_COOKIE_NAME, AUTH_COOKIE_NAME } from '@/config/constants';
import { isDevelopment } from '@/config/env';

/**
 * Runtime backend switcher (beta-tester tool). Persists the chosen environment
 * in the `bonyad-api-env` cookie and clears the session — a JWT minted by one
 * backend is meaningless to the other, so the client must route back to login.
 * Web analogue of the Android EnvironmentManager.switchTo(). See
 * `docs/api-environment-switcher.md`.
 */

const ENV_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = (await req.json().catch(() => null)) as { key?: string } | null;
  const env = apiEnvironmentFromKey(payload?.key);

  const store = await cookies();
  store.set(API_ENV_COOKIE_NAME, env.key, {
    httpOnly: false, // client reads it to render the env badge
    secure: !isDevelopment,
    sameSite: 'lax',
    path: '/',
    maxAge: ENV_MAX_AGE_SECONDS,
  });
  store.delete(AUTH_COOKIE_NAME); // switching invalidates the current session

  return NextResponse.json({ ok: true, env: env.key });
}
