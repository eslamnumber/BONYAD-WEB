# Security headers, CSP, CSRF, rate-limiting

This doc covers headers and adjacent web-security concerns. Auth/JWT lives in [api-and-auth.md](api-and-auth.md); error reporting in [error-handling.md](error-handling.md).

## Rules

1. **Every response gets a strict security-header baseline.** Configured once in `next.config.ts` via `headers()`. No per-route overrides.
2. **CSP uses a per-request nonce.** Inline scripts (including JSON-LD) must carry the nonce. No `'unsafe-inline'` in production.
3. **State-changing requests (`POST`/`PUT`/`PATCH`/`DELETE`) on `app/api/**`require a CSRF guard.** Double-submit cookie pattern + same-origin`Origin` check.
4. **Auth endpoints are rate-limited.** Login, register, refresh-token, forgot-password — IP + email keys.
5. **Stringified JSON-LD is HTML-escaped.** `JSON.stringify` alone is unsafe inside `<script>` if any field can contain `<`, `&`, or `</script>`.

## Headers baseline — `next.config.ts`

```ts
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
];

const config: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
export default config;
```

## CSP with per-request nonce — `middleware.ts`

The nonce is generated per request, passed through a header, and consumed by the root layout. This is the only safe pattern for inline JSON-LD.

```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`, // Tailwind generates inline styles in dev; tighten in prod via hash list
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://bonyad-app-nyayeditqq-ww.a.run.app https://*.sentry.io`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');
  const res = NextResponse.next({ request: { headers: new Headers(req.headers) } });
  res.headers.set('x-nonce', nonce);
  res.headers.set('Content-Security-Policy', csp);
  return res;
}
export const config = { matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico).*)' }] };
```

Read the nonce in the root layout:

```tsx
// app/layout.tsx
import { headers } from 'next/headers';
const nonce = (await headers()).get('x-nonce') ?? undefined;
// pass `nonce` to <JsonLd /> and to any <Script /> tags
```

## Safe JSON-LD — `components/seo/json-ld.tsx`

```tsx
type JsonLdProps = { data: object; nonce?: string };

function escape(s: string) {
  // Escape characters unsafe inside <script>: </script>, <!--, <, >, &, U+2028/2029
  return s
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/ /g, '\\u2028')
    .replace(/ /g, '\\u2029');
}

export function JsonLd({ data, nonce }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: escape(JSON.stringify(data)) }}
    />
  );
}
```

Untrusted fields (technician bio, blog content) flow through this. Without escaping, a bio containing `</script><script>...` lands as live HTML in the page.

## CSRF — same-origin proxy routes

The auth cookie is `SameSite=Lax`, which blocks third-party POSTs but not same-site CSRF (e.g. a malicious subdomain or an embedded subresource). For any state-changing route handler:

1. Issue a `csrf` cookie (non-`httpOnly`, `Secure`, `SameSite=Strict`) at login containing a random 32-byte token.
2. Client mirrors it in the `X-CSRF-Token` header on every mutating request via `apiClient`.
3. Route handler rejects if `cookie.csrf !== header['x-csrf-token']`, or if `req.headers.get('origin')` is not in the allowlist.

The `apiClient` reads the `csrf` cookie via `document.cookie` and adds the header automatically. Read-only `GET`/`HEAD` requests skip the check.

## Rate limiting — `app/api/auth/login/route.ts`

Use [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) with Redis (or Vercel KV). Two keys per request: client IP and submitted email. The stricter one wins.

```ts
const ipLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m') });
const emailLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m') });
// Apply to /auth/login, /auth/register, /auth/forgot-password, /auth/refresh-token.
```

On failure return `429` with `Retry-After`. Log to Sentry with `tags: { kind: 'rate-limit' }`.

## Secrets and env

- Never read `process.env.X` directly outside `config/env.ts`. That file zod-validates every var at boot and exports `env`.
- `SERVER_*` prefix for server-only secrets; `NEXT_PUBLIC_*` for client-exposed config. A server secret in a client component is a build-fail (enforced by an ESLint custom rule + grep in CI).

## What to verify before launch

- [ ] [securityheaders.com](https://securityheaders.com) grade ≥ A on production URL.
- [ ] [Mozilla Observatory](https://observatory.mozilla.org) score ≥ 90.
- [ ] CSP has no `'unsafe-inline'` in `script-src` on production.
- [ ] Every inline `<script>` (JSON-LD, GA, etc.) carries the request nonce.
- [ ] CSRF guard rejects requests with missing/mismatched token (manual curl test).
- [ ] Rate limiter returns `429` after the threshold (manual test).
- [ ] Sentry DSN is the public one; private/server DSN is never exposed.
