# SEO, SSR, and AI-readability

## Goal

Make public pages discoverable in three places: Google, AI search engines (Perplexity, ChatGPT search, Google AI Overviews, Claude search), and AI assistants citing sources. This is **GEO/AEO** (Generative Engine Optimization / Answer Engine Optimization) on top of classic SEO.

The single biggest lever: **public content must be fully rendered server-side** so crawlers see real HTML, not a hydration shell. Most AI crawlers don't execute JS.

## What's public vs private

| Surface                                                                                        | Visibility            | Rendering                                         |
| ---------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------- |
| Homepage, services, technicians directory, technician profile, blog, help center, FAQ, contact | **Public, indexable** | SSR / SSG / ISR — must be in initial HTML         |
| Login, register, forgot-password                                                               | Public, **noindex**   | SSR                                               |
| Projects, bids, chat, payments, profile, all authenticated routes                              | Private, **noindex**  | Mixed; not visible to crawlers anyway (auth wall) |

## Rules

### 1. SSR by default

1. **Every public route uses Server Components.** No `'use client'` at the page level for public pages. Client components stay isolated to leaf interactivity (a search box, a dropdown).
2. **Data for public pages is fetched on the server** in the page file (`async function Page()` directly calling the fetcher), not via TanStack Query on the client. Crawlers see the data in the HTML response.
3. **Authenticated pages can be `'use client'` heavy** — they're behind auth, no crawler reaches them.
4. **Public pages use `revalidate` (ISR), not `dynamic = 'force-dynamic'`.** Caches the rendered HTML at the CDN and re-renders on a schedule. Faster for crawlers and users.
   ```ts
   export const revalidate = 3600; // re-render hourly
   ```
5. **For technician profiles and blog articles** (high-volume, low-update), use `generateStaticParams` to pre-render the most popular ones at build time.

### 2. Metadata API — required on every public page

Every public route exports `generateMetadata` (or `metadata` if static):

```ts
// app/technicians/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const tech = await getTechnician(params.id);
  return {
    title: `${tech.name} — ${tech.services[0]?.name} in ${tech.region}`,
    description: tech.description.slice(0, 160),
    alternates: {
      canonical: `/technicians/${tech.id}`,
      languages: {
        en: `/en/technicians/${tech.id}`,
        ar: `/ar/technicians/${tech.id}`,
      },
    },
    openGraph: {
      title: tech.name,
      description: tech.description.slice(0, 160),
      images: [{ url: tech.profileImage, width: 1200, height: 630 }],
      type: 'profile',
      locale: 'en_SA',
      alternateLocale: 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

Rules:

- **`title` under 60 chars**, includes the most-searched keyword first.
- **`description` 140–160 chars**, written for humans (it appears in search results verbatim).
- **`canonical`** always set to the preferred URL — prevents duplicate-content penalties from query strings.
- **`alternates.languages`** for both `en` and `ar` — this is `hreflang`.
- **`openGraph.images`** at 1200×630 — required for rich link previews on Twitter, Slack, WhatsApp, LinkedIn.

### 3. Structured data (JSON-LD) — required on every public page

Search engines and AI assistants extract structured data to surface rich results. Without it, your content competes only on text relevance. With it, you become _citable_.

Add a JSON-LD `<script>` to every public page. Use [schema.org](https://schema.org) types:

| Page                        | Schema type(s)                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Homepage                    | `Organization` + `LocalBusiness` (`areaServed: SA`) + `WebSite` (with `SearchAction`) |
| Service category page       | `Service` (with `areaServed`) + `BreadcrumbList`                                      |
| Technician profile          | `Person` + `Service` (offered) + `AggregateRating` + `Review` (×N)                    |
| Project listing (if public) | `ItemList` of `Offer`                                                                 |
| Blog article                | `Article` + `Person` (author) + `BreadcrumbList`                                      |
| Help center article         | `Article` or `HowTo` + `BreadcrumbList` + `Speakable` (for voice)                     |
| FAQ page                    | `FAQPage` with `Question` + `Answer` + `Speakable`                                    |
| Contact                     | `ContactPage` + `Organization`                                                        |

Implementation lives in `src/components/seo/json-ld.tsx`. The stringified JSON **must be HTML-escaped** before injection — an unescaped technician bio containing `</script>` is a live XSS. See [security-headers.md](security-headers.md) for the full pattern including the CSP nonce.

```tsx
type JsonLdProps = { data: object; nonce?: string };
const escape = (s: string) =>
  s.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

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

Rendered in the page Server Component:

```tsx
<JsonLd
  data={{
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: tech.name,
    jobTitle: tech.services[0]?.name,
    image: tech.profileImage,
    address: { '@type': 'PostalAddress', addressRegion: tech.region, addressCountry: 'SA' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tech.averageRating,
      reviewCount: tech.reviewCount,
    },
  }}
/>
```

**Validate every JSON-LD block** with Google's [Rich Results Test](https://search.google.com/test/rich-results) before merging.

### 4. AI crawler policy

Place at `public/robots.txt`:

```
User-agent: *
Allow: /

# AI search & assistant crawlers — allow for citation
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /

# Block crawlers from authenticated and ops areas
User-agent: *
Disallow: /api/
Disallow: /app/
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

Sitemap: https://bonyad-hub.com/sitemap.xml
```

Add **`public/llms.txt`** — the emerging convention for LLM-friendly site summaries (used by Anthropic, Perplexity, and others to find canonical entry points):

```
# Bonyad

> Marketplace connecting customers in Saudi Arabia with verified construction
> and home-service technicians. Customers post projects, technicians bid,
> phases get paid milestone-by-milestone, both sides sign digital contracts.

## Key pages

- [Services](https://bonyad-hub.com/services): Browse service categories
- [Technicians](https://bonyad-hub.com/technicians): Verified technicians directory
- [Help center](https://bonyad-hub.com/help): How Bonyad works
- [Blog](https://bonyad-hub.com/blog): Articles and guides

## Languages

- English: https://bonyad-hub.com/en
- Arabic: https://bonyad-hub.com/ar
```

Update `llms.txt` whenever the public surface changes.

Also publish **`public/llms-full.txt`** — the larger variant containing full text of the homepage + key help articles + FAQ. AI engines (Anthropic, Perplexity) prefer it when they need more than a directory of links. Cap at ~100 KB; rebuild on content changes via the same flow that hits `revalidateTag`.

### 4a. `metadataBase` in the root layout

Required once at `app/layout.tsx` — without it, `openGraph.images` and `alternates.canonical` resolve to relative URLs and break in production link previews:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
};
```

### 4b. Internal linking — the cheapest ranking lever

Every public page must link out to **≥2 related public pages from in-content text** (not just the global nav). Examples:

- A technician profile links to other technicians in the same service + the parent service category.
- A blog article links to ≥2 related articles in the same content cluster.
- The homepage links to top services + a curated set of high-intent landing pages.

This is the single biggest signal GSC uses to discover, cluster, and rank pages. Skipping it is the most common reason a well-built site never breaks out of "Discovered but not indexed".

### 5. Sitemap

`app/sitemap.ts` generates `sitemap.xml` dynamically from the API:

```ts
import type { MetadataRoute } from 'next';
import {
  getAllTechnicianSlugs,
  getAllBlogSlugs,
  getAllHelpArticleSlugs,
} from '@/features/.../sitemap-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [technicians, blogs, helpArticles] = await Promise.all([
    getAllTechnicianSlugs(),
    getAllBlogSlugs(),
    getAllHelpArticleSlugs(),
  ]);
  const base = 'https://bonyad-hub.com';
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/services`, changeFrequency: 'weekly', priority: 0.9 },
    ...technicians.map((t) => ({
      url: `${base}/technicians/${t.id}`,
      lastModified: t.updatedAt,
      priority: 0.8,
    })),
    ...blogs.map((b) => ({
      url: `${base}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      priority: 0.7,
    })),
    ...helpArticles.map((a) => ({
      url: `${base}/help/${a.id}`,
      lastModified: a.updatedAt,
      priority: 0.6,
    })),
  ];
}
```

### 6. Semantic HTML (the cheap SEO win)

1. **One `<h1>` per page**, top of main content, contains the primary keyword.
2. **`<h2>`–`<h6>` in hierarchical order** — no skipping levels.
3. **Landmarks**: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` — each used exactly once at the top level.
4. **`<article>` for blog/help posts, `<section>` for thematic groups.**
5. **Lists are real lists** (`<ul>`, `<ol>`, `<dl>`), not stacked `<div>`s.
6. **Tables for tabular data only** — and they need `<th scope>` and `<caption>`.
7. **Every image has descriptive `alt` text.** Not `"image"`, not `"photo"`. For decorative images, `alt=""`.
8. **Links have descriptive text.** ❌ "Click here". ✅ "Browse plumbing technicians".

### 7. i18n SEO

- The default locale lives at `/` (or `/en`, decide once and stick with it).
- Arabic content lives at `/ar/...` mirror paths.
- `<html lang="ar" dir="rtl">` for Arabic, `<html lang="en" dir="ltr">` for English.
- Every page sets `alternates.languages` in its metadata so Google and AI engines know the pages are translations of each other.
- Translated content should be a **real translation**, not auto-translated stubs — search engines penalize thin/machine-translated content.

### 8. Performance — Core Web Vitals

Both Google and AI crawlers prefer fast pages. Hit these targets:

| Metric                          | Target  |
| ------------------------------- | ------- |
| LCP (Largest Contentful Paint)  | < 2.5s  |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift)   | < 0.1   |
| TTFB                            | < 800ms |

Tactics already baked into other rules:

- Server Components by default → smaller JS bundle.
- `next/image` for all images (auto-resizing, lazy-loading, AVIF/WebP).
- `next/font` for fonts (no FOUT, preloaded).
- Tailwind v4 (small CSS, JIT).
- Code-splitting per route by Next.js automatically.

Add: **lazy-load heavy feature components** with `next/dynamic`:

```ts
const ProjectChat = dynamic(() => import('@/features/chat').then(m => m.ProjectChat), {
  loading: () => <LoadingState />,
  ssr: false, // only if it's client-only
});
```

### 9. AI-citability — write content AI can extract cleanly

AI search engines like Perplexity quote your content directly. Make it quotable:

1. **Lead with the answer**, then explain. The first sentence of any FAQ answer or help article should _be_ the answer, not preamble.
2. **One concept per paragraph.** Long walls of text are hard to extract.
3. **Use definition-style sentences.** "Bonyad is a marketplace that connects customers with verified construction technicians in Saudi Arabia." (Clean fact, easy to quote.)
4. **Use lists and tables for facts.** Pricing tiers, service categories, supported regions — all easier for AI to extract from a list than from prose.
5. **Cite authoritative sources** when claims need backing (regulations, certifications). AI engines reward sourced content.
6. **Add dates.** "Updated: 2026-05" on articles tells AI engines the content is fresh.

### 10. What goes in the page `<head>` beyond metadata

- Favicons + apple-touch-icons (via `app/icon.tsx` + `app/apple-icon.tsx`).
- Manifest (`app/manifest.ts`) for PWA-style installability.
- Preload critical assets (hero image, Arabic font) when measured to help LCP.

## Per-page SEO checklist (add to new-screen-checklist.md)

For every **public** page:

- [ ] Page is a Server Component (no `'use client'` at the page level).
- [ ] `generateMetadata` returns title (<60), description (140–160), canonical, OG image, alternates.languages for en+ar.
- [ ] JSON-LD `<script>` rendered with the right schema.org type.
- [ ] `<h1>` exists exactly once, contains the primary keyword.
- [ ] All images use `next/image` with descriptive `alt`.
- [ ] Page added to `sitemap.ts` (or auto-included via dynamic generation).
- [ ] Validated in Google Rich Results Test.
- [ ] LCP < 2.5s measured on a slow-3G profile.

For every **private** page:

- [ ] `metadata.robots = { index: false, follow: false }` set.

## Tools to run before merging a public-page PR

- `npx @next/bundle-analyzer` — bundle size check.
- Google Rich Results Test on the production URL.
- Lighthouse CI in the PR pipeline — fail on Core Web Vitals regression > 5%.
- `pa11y` or `axe-core` for accessibility (separate concern but related; AI engines surface accessible content).
