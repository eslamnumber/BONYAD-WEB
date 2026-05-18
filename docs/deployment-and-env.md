# Deployment, environments, and env vars

This doc covers hosting, pipelines, environments, and env-var management. Code-level config lives in [tech-stack.md](tech-stack.md); secrets in [security-headers.md](security-headers.md).

## Hosting target

**Vercel** for the web app. Reasons:

- First-party Next.js 15 App Router support — ISR, streaming, edge middleware, image optimization all work out of the box.
- Free preview deployments per PR, branch-scoped env vars.
- Built-in OG image generation, web-analytics, Speed Insights.
- Same region presence in the Middle East (Bahrain `bom1`/`fra1`) for low latency to Saudi users.

**Backend stays on Cloud Run.** No change there. The web app calls the backend via a server-side proxy route handler (see [api-and-auth.md](api-and-auth.md)).

If Vercel is not chosen, the fallback is **Cloud Run with `output: 'standalone'`** + Cloudflare CDN. Document the choice in this file once locked.

## Environments

| Name           | URL                                   | Branch        | Auto-deploy   |
| -------------- | ------------------------------------- | ------------- | ------------- |
| **Production** | `https://bonyad-hub.com`              | `main`        | Yes, on merge |
| **Staging**    | `https://staging.bonyad-hub.com`      | `staging`     | Yes, on merge |
| **Preview**    | `https://bonyad-web-<sha>.vercel.app` | Any PR branch | Yes, per push |
| **Local**      | `http://localhost:3000`               | —             | —             |

Staging hits a **staging backend** (when the backend team provides one). Until then it points at the production API with a `X-Env: staging` header — coordinate before writing any data.

## Env-var schema — `src/config/env.ts`

Every env var is declared, zod-validated, and accessed via the typed `env` export. No `process.env.X` anywhere else.

```ts
// src/config/env.ts
import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SERVER_API_PROXY_TOKEN: z.string().min(32),
  REVALIDATE_SECRET: z.string().min(32),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(20).optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url(),
  NEXT_PUBLIC_ANALYTICS_KEY: z.string().optional(),
});

const isServer = typeof window === 'undefined';
const parsed = isServer
  ? serverSchema.merge(clientSchema).safeParse(process.env)
  : clientSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_ANALYTICS_KEY: process.env.NEXT_PUBLIC_ANALYTICS_KEY,
    });

if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}
export const env = parsed.data;
```

Rules:

1. **`NEXT_PUBLIC_*` is client-readable** — never put a secret here.
2. **`SERVER_*` and unprefixed vars are server-only.** Importing one from a client component is a build error (enforced by an ESLint rule).
3. **`.env.example` is checked in.** Every required var listed with a placeholder value. Onboarding doc tells new devs to copy it to `.env.local`.

## CI/CD pipeline

GitHub Actions, runs on every PR + push to `main`/`staging`:

```yaml
# .github/workflows/ci.yml (sketch)
jobs:
  ci:
    steps:
      - pnpm install --frozen-lockfile
      - pnpm typecheck
      - pnpm lint
      - pnpm test # vitest
      - pnpm build # next build — catches config errors
      - pnpm test:e2e # playwright on the built app
      - pnpm test:a11y # pa11y-ci
      - lighthouse-ci # fail if CWV regress > 5%
```

Vercel runs its own build on top — the GH job catches issues _before_ a preview URL gets shared.

## Build and runtime config

- **`output: 'standalone'`** is **not** set when deploying to Vercel.
- **`reactStrictMode: true`** in `next.config.ts`.
- **`poweredByHeader: false`** — strip the `X-Powered-By: Next.js` header.
- **`compress: true`** — handled by Vercel; explicit is fine.
- **Image domains / remote patterns** locked to the backend host and any approved CDN. No wildcards.

## Cache and CDN

- Vercel handles CDN automatically. ISR-rendered pages live at the edge until `revalidate` or `revalidateTag` fires. See [caching-and-runtime.md](caching-and-runtime.md).
- Static assets under `/public` get a 1-year immutable `Cache-Control` automatically.
- Custom `Cache-Control` only via `headers()` in `next.config.ts` — never via middleware.

## Rollback

- **Vercel: one-click promote a previous deployment.** No git revert needed for fast rollback.
- **DB or backend incompatibilities:** rollback the web app first, then coordinate backend rollback if needed. Web is decoupled enough that this is usually safe.
- Tag every production deployment with the git SHA in Sentry releases so source maps + breadcrumbs line up.

## Domain and DNS (one-time, launch day)

1. Buy `bonyad-hub.com` (if not done) and add to Vercel.
2. Pick canonical: `bonyad-hub.com` (apex) — `www` 301-redirects to it.
3. Add DNS records Vercel prompts for. Verify HTTPS issued.
4. Add the domain to Google Search Console + Bing Webmaster Tools (see [seo-operational-checklist.md](seo-operational-checklist.md) Phase 2).

## What to verify before each release

- [ ] All env vars present in Vercel project for the target environment.
- [ ] CI green on the deploy commit.
- [ ] Sentry release created and source maps uploaded.
- [ ] Preview deployment manually smoke-tested in EN + AR, light + dark.
- [ ] No new `console.log` in production code (ESLint `no-console`).
- [ ] Bundle-size diff < 10 KB gzipped (or justified in PR description).
