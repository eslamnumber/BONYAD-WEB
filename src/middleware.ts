import { NextResponse, type NextRequest } from 'next/server';

import {
  AUTH_COOKIE_NAME,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  PROTECTED_PATH_PREFIXES,
} from '@/config/constants';
import { isDevelopment } from '@/config/env';
import { ROUTES } from '@/config/routes';
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
 *   4. Redirect unauthenticated requests away from protected prefixes
 *      (`/dashboard`, `/app/*`) to `/login?next=<path>`.
 *
 * NOT yet handled:
 *   - CSRF token rotation.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtected(pathname) && !request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const nonce = generateNonce();
  const csp = buildCsp(nonce, pathname.startsWith('/payment'));

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

function isProtected(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Base64 encode.
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string, isPaymentRoute: boolean): string {
  // Google Maps SDK (location picker): the script host (needed in dev; ignored under
  // prod `strict-dynamic`, where the nonce'd loader propagates trust) + the Places/
  // Geocoding XHR origins. Map tiles are images, covered by `img-src https:`.
  const maps = 'https://maps.googleapis.com https://maps.gstatic.com';
  // HyperPay COPYandPAY widget (payment route only): in prod the widget script is
  // injected by our nonce-trusted bundle, so `strict-dynamic` covers it (no host
  // needed); in dev we add the host. Its XHR / inline styles / fonts also need oppwa.
  const opp = isPaymentRoute ? ' https://*.oppwa.com' : '';
  // Dev mode needs to allow eval + inline for React Fast Refresh + Tailwind.
  // Production locks down to nonce + strict-dynamic.
  const scriptSrc = isDevelopment
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' ${maps}${opp}`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' ${maps}`;

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'${opp}`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:${opp}`,
    `connect-src 'self' https://*.sentry.io wss://admin.bonyad-hub.com ${maps}${opp}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'${opp}`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ];
  // 3DS ACS challenge pages render in iframes on arbitrary bank domains — allow https:
  // frames on the payment route ONLY. Elsewhere we add no `frame-src`, so frames fall
  // back to `default-src 'self'` (which keeps the sandboxed terms `srcDoc` iframe working).
  if (isPaymentRoute) {
    directives.push(`frame-src 'self' https://*.oppwa.com https:`);
  }

  return directives.join('; ');
}

export const config = {
  matcher: [
    // Run on every path EXCEPT static assets, Next internals, and the contract-PDF
    // stream. The latter is excluded so the global `frame-ancestors 'none'` CSP never
    // lands on it — that response sets its own `frame-ancestors 'self'` so the
    // CONTRACT_SIGNING screen can embed it in a same-origin iframe (see route handler).
    '/((?!_next/static|_next/image|favicon.ico|api/contract-pdf|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
