import { cookies, headers } from 'next/headers';

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from '@/config/constants';
import { isLocale, type Locale } from '@/types/locale';

/**
 * Read the current locale from the `bonyad-lang` cookie on the server.
 * Falls back to DEFAULT_LOCALE if the cookie is missing or has an unknown value.
 *
 * Call from Server Components, route handlers, and `generateMetadata`.
 * Do NOT call from client components — use the locale store there instead.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Read the per-request CSP nonce set by `middleware.ts`.
 * Pass to `<JsonLd>`, `<Script>`, or any inline-script-emitting component.
 *
 * Returns `undefined` outside a request context (e.g. unit tests).
 */
export async function getRequestNonce(): Promise<string | undefined> {
  const headerStore = await headers();
  return headerStore.get('x-nonce') ?? undefined;
}
