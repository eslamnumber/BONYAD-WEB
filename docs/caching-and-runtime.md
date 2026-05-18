# Caching and runtime — pick the right rendering mode

App Router gives you four rendering modes. Picking wrong wastes money and hurts SEO. This doc is the decision tree.

## The four modes

| Mode             | Trigger                                                                    | When                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Static (SSG)** | No dynamic functions, no `revalidate`, no `cookies()`/`headers()`          | Content that never changes per user and rarely per time — marketing pages, legal, about.                                              |
| **ISR**          | `export const revalidate = N` or `fetch(..., { next: { revalidate: N } })` | Public content that updates on a schedule — technician profiles, blog, help center, services directory. **Default for public pages.** |
| **Dynamic SSR**  | `cookies()`, `headers()`, `searchParams`, `dynamic = 'force-dynamic'`      | Personalized per request — authenticated pages, search results with user filters.                                                     |
| **Streaming**    | `<Suspense>` boundary with async children                                  | Slow data on an otherwise fast page — defer chat threads, load above-the-fold first.                                                  |

## Decision tree

```
Is the page behind auth?
  └─ yes → Dynamic SSR. Set `metadata.robots = { index: false }`.
  └─ no  → Is the content the same for everyone?
            ├─ no  → Dynamic SSR (e.g. localized via cookie).
            └─ yes → Does it update?
                     ├─ never        → Static.
                     ├─ on schedule  → ISR with `revalidate`.
                     └─ on event     → ISR + `revalidateTag` from a route handler.
```

## Rules

1. **Public pages default to ISR.** Set `export const revalidate = 3600` (or shorter) at the route level. Never `force-dynamic` for public content — it kills the CDN cache.
2. **Use tag-based invalidation for content that updates on an event.** A technician edits their profile → backend webhook hits `app/api/revalidate/route.ts` → `revalidateTag('technician:<id>')`. Far better than a short `revalidate` interval.
3. **Use `generateStaticParams` for high-traffic dynamic routes.** Pre-build the top-N technician profiles and blog posts at deploy time. The rest fall back to on-demand ISR.
4. **`fetch` cache options are explicit on every call inside Server Components.** No implicit defaults — they have changed across Next versions and silent caching is a recurring source of bugs.
   - Public data → `fetch(url, { next: { revalidate: N, tags: ['technician:123'] } })`
   - Personalized → `fetch(url, { cache: 'no-store' })`
   - One-shot at build time → `fetch(url, { cache: 'force-cache' })`
5. **No `useQuery` for data needed in initial HTML on a public page.** It will not be in the SSR output — crawlers and AI engines miss it. Fetch on the server, pass as a prop, optionally hydrate into TanStack Query for interactivity.
6. **Streaming `<Suspense>` is allowed only when measured.** It improves TTFB but can hurt LCP if the streamed chunk _is_ the LCP element. Verify with Lighthouse.

## `metadataBase` — mandatory in root layout

Without it, `openGraph.images` and `alternates.canonical` resolve to relative URLs that break in production link previews.

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  // ...
};
```

## Tag invalidation — endpoint pattern

```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret');
  if (secret !== env.REVALIDATE_SECRET) return new Response('Unauthorized', { status: 401 });
  const { tag } = await req.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

Backend calls this whenever a technician profile, blog post, or help article is published or edited.

## Edge vs Node runtime

| Concern                                      | Pick                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `middleware.ts`                              | **Edge (forced)** — keep it tiny, no DB calls.                         |
| Route handlers with crypto/DB/SDK use        | **Node** — set `export const runtime = 'nodejs'`.                      |
| Route handlers doing only header/cookie work | **Edge** — lower latency, cheaper.                                     |
| Public pages                                 | **Node** by default — Sentry, image loader, and most SDKs target Node. |

The Sentry Next SDK and many image-processing libs are not edge-safe. If in doubt, Node.

## Route segment config — copy-paste defaults

For a typical public listing page (e.g. `app/technicians/page.tsx`):

```ts
export const dynamic = 'error'; // Fail the build if anything forces dynamic.
export const revalidate = 3600; // Re-render hourly + on tag.
export const dynamicParams = true; // Allow new slugs at runtime via ISR.
```

For an authenticated page under `app/(app)/`:

```ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
// metadata.robots already set to noindex in the (app) layout.
```

## Sanity checks per public-page PR

- [ ] `export const revalidate = N` set, or page is fully static.
- [ ] `fetch` calls inside the page pass an explicit `cache` or `next` option.
- [ ] If listing/dynamic, `generateStaticParams` returns the top-N slugs.
- [ ] If updated by backend events, a `revalidateTag` call exists somewhere in the publish flow.
- [ ] `metadataBase` is set in the root layout (one-time check).
- [ ] Built page reaches LCP < 2.5s on a slow-3G profile.
