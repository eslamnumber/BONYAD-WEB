import { NextResponse, type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from '@/config/constants';
import { isDevelopment } from '@/config/env';
import { isLocale } from '@/types/locale';

/**
 * Edge middleware — runs on every page request (asset paths excluded by matcher).
 *
 * Responsibilities (public-screens scope):
 *   1. Generate a per-request CSP nonce and attach it via the `x-nonce` request header.
 *      Layouts/components read it via `headers().get('x-nonce')` and pass it to
 *      `<JsonLd>` and any `<Script>` tags.
 *   2. Set a Content-Security-Policy response header.
 *   3. Ensure the `bonyad-lang` cookie has a value — default to DEFAULT_LOCALE if missing.
 *
 * NOT yet handled (added when auth lands):
 *   - Redirect unauthenticated requests away from `/app/*`.
 *   - CSRF token rotation.
 */
export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);

  // Ensure locale cookie always has a sane value so server-side reads never miss.
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (!isLocale(localeCookie)) {
    response.cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LOCALE, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Base64 encode.
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string): string {
  // Dev mode needs to allow eval + inline for React Fast Refresh + Tailwind.
  // Production locks down to nonce + strict-dynamic.
  const scriptSrc = isDevelopment
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.sentry.io`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

export const config = {
  matcher: [
    // Run on every path EXCEPT static assets and Next internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
