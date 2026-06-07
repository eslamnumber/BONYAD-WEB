import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/config/constants';

/**
 * Mint a broker credential for the browser MQTT client. The realtime chat broker
 * authenticates a connection with the session JWT as its username, but that JWT
 * lives in an httpOnly cookie the browser cannot read. This same-origin handler
 * reads the cookie server-side and hands the token to the authenticated client
 * for the duration of its broker session. See `src/lib/mqtt-chat.ts`.
 *
 * Dynamic + `no-store`: the response is per-session and must never be cached.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { messageEn: 'Not authenticated.', errorCode: 'NO_SESSION' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}
