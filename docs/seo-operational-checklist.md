# SEO operational checklist — what to do outside the codebase

[`seo-and-ai-readability.md`](seo-and-ai-readability.md) covers _what to code_. This doc covers _what to do during and after development_ — domain setup, search-engine submissions, ongoing tasks. These steps are non-code, but the architecture is wasted without them.

## What a sitemap is (1-paragraph version)

A sitemap is an XML file at `/sitemap.xml` that lists every public URL on your site. You hand it to search engines so they don't have to discover pages by crawling links. Next.js generates it from `app/sitemap.ts`. Without submitting it to Google Search Console + Bing Webmaster Tools, indexing takes weeks instead of days.

## Phase 1 — During development (must be done before first deploy)

| #   | Task                                                                                                                              | Where         | Done? |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----- |
| 1   | Choose canonical domain (`www.bonyad-hub.com` or `bonyad-hub.com`). 301-redirect the other.                                       | DNS / hosting | ☐     |
| 2   | Set `NEXT_PUBLIC_SITE_URL=https://bonyad-hub.com` in env (zod-validated in `config/env.ts`).                                      | `.env`        | ☐     |
| 3   | Implement `app/sitemap.ts` generating URLs for: homepage, services, every public technician, every blog post, every help article. | code          | ☐     |
| 4   | Add `public/robots.txt` allowing GPTBot/ClaudeBot/PerplexityBot/Googlebot and blocking `/api`, `/app`, `/login`, etc.             | code          | ☐     |
| 5   | Add `public/llms.txt` with site description and key pages.                                                                        | code          | ☐     |
| 6   | Create OG image template at `app/opengraph-image.tsx` (1200×630, brand-styled).                                                   | code          | ☐     |
| 7   | Add favicon set: `app/icon.tsx`, `app/apple-icon.tsx`.                                                                            | code          | ☐     |
| 8   | Implement `<JsonLd>` component and wire schema.org markup on every public page.                                                   | code          | ☐     |
| 9   | Implement `app/not-found.tsx` (404 page) with semantic content + links back to key pages.                                         | code          | ☐     |
| 10  | Implement `<html lang dir>` from cookie in `app/layout.tsx`.                                                                      | code          | ☐     |
| 11  | Set `metadata.robots = { index: false, follow: false }` on every page under `(app)/` and `(auth)/`.                               | code          | ☐     |
| 12  | Add Sentry init (`@sentry/nextjs`) with `release` = git SHA, environment = prod/staging.                                          | code          | ☐     |
| 13  | Add Google Analytics 4 or Plausible (decide which) — script in root layout, behind cookie consent.                                | code          | ☐     |
| 14  | Add Mixpanel (parity with RN app) for product analytics.                                                                          | code          | ☐     |

## Phase 2 — Launch day (one-time setup, ~2 hours)

| #   | Task                                                                                                                                                                                       | Where                                                                        | Done? |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----- |
| 1   | **Verify HTTPS** is live on the production domain and `http://` redirects to `https://`.                                                                                                   | hosting                                                                      | ☐     |
| 2   | **Visit** `https://bonyad-hub.com/sitemap.xml` and `https://bonyad-hub.com/robots.txt` — both must return valid XML/text.                                                                  | browser                                                                      | ☐     |
| 3   | **Visit** `https://bonyad-hub.com/llms.txt` — must return markdown.                                                                                                                        | browser                                                                      | ☐     |
| 4   | **Create Google Search Console property** for the domain. Verify via DNS TXT record.                                                                                                       | [search.google.com/search-console](https://search.google.com/search-console) | ☐     |
| 5   | **Submit sitemap to GSC** (`Sitemaps → Add → sitemap.xml`).                                                                                                                                | GSC                                                                          | ☐     |
| 6   | **Request indexing** for the homepage and 5–10 key pages via GSC's URL Inspection tool.                                                                                                    | GSC                                                                          | ☐     |
| 7   | **Create Bing Webmaster Tools account**, verify domain, submit sitemap. (Bing's index powers ChatGPT search — critical.)                                                                   | [bing.com/webmasters](https://www.bing.com/webmasters)                       | ☐     |
| 8   | **Enable IndexNow** in Bing Webmaster Tools and generate an API key. IndexNow pushes new/updated URLs to Bing + Yandex instantly.                                                          | Bing                                                                         | ☐     |
| 9   | **Validate JSON-LD** for homepage + one technician profile + one blog post on [Rich Results Test](https://search.google.com/test/rich-results). Fix any errors before they hit production. | tool                                                                         | ☐     |
| 10  | **Run [PageSpeed Insights](https://pagespeed.web.dev)** on homepage. LCP must be < 2.5s, CLS < 0.1, INP < 200ms.                                                                           | tool                                                                         | ☐     |
| 11  | **Set up Google Business Profile** for the company. Add address, hours, photos, services. (Local SEO boost for Saudi market.)                                                              | [business.google.com](https://business.google.com)                           | ☐     |
| 12  | **Submit to local directories**: Yelp Saudi, Saudi business directories, contractor-marketplace listings. Each is a backlink.                                                              | manual                                                                       | ☐     |
| 13  | **Apply for Wikidata entry** for the company (helps AI engines treat you as a known entity).                                                                                               | wikidata.org                                                                 | ☐     |
| 14  | **Set up Sentry alerts** for critical errors to Slack/email.                                                                                                                               | Sentry dashboard                                                             | ☐     |

## Phase 3 — Per content piece (ongoing, every blog post / help article / new technician)

Whenever a public page is published or significantly updated:

1. **Ping IndexNow** via the API to push the URL to Bing/Yandex immediately. Add this to the publish flow — fire-and-forget POST request.
2. **Submit URL in Google Search Console** ("Request indexing") for first 50 pages, then trust the sitemap.
3. **Validate JSON-LD** if the page has new schema markup.
4. **Test on mobile** — most search traffic is mobile; Google indexes the mobile version.

## Phase 4 — Weekly maintenance (15 minutes)

- **Check GSC's Coverage report**: are new pages getting indexed? Are old ones being de-indexed (means a bug)?
- **Check GSC's Performance report**: which queries drive traffic? Identify content gaps.
- **Check Sentry**: any new error patterns? Hydration mismatches kill SEO silently.
- **Check Bing Webmaster Tools**: same checks for AI-search visibility.

## Phase 5 — Monthly maintenance (1 hour)

- **Lighthouse audit** on 5 random public URLs. Fix any regression.
- **Manual AI engine test**: ask Perplexity/ChatGPT-search/Claude-with-web _"What is Bonyad?"_ and _"Find a verified [service] technician in [city]"_. Are you appearing? Note rank.
- **Audit `llms.txt`** — is it still accurate? Add new top-level routes.
- **Check broken-link report** in GSC. Fix 404s or 301-redirect them.
- **Refresh stale content**: any blog post over 6 months old gets reviewed and re-dated if still accurate (freshness is a ranking signal).

## Phase 6 — Quarterly

- **SEO audit** with a tool like Ahrefs, SEMrush, or Screaming Frog (free up to 500 URLs). Find broken links, duplicate content, missing meta.
- **Backlink check**: how many sites link to you now? Reach out to relevant sites for guest posts / collaborations.
- **Content gap analysis**: which competitor pages rank that yours don't? Plan content to close gaps.
- **Re-test all JSON-LD** — schema.org spec evolves; what was valid last quarter may have new optional fields.

## Free tools you'll use repeatedly

- [Google Search Console](https://search.google.com/search-console) — indexing, queries, errors
- [Bing Webmaster Tools](https://www.bing.com/webmasters) — same for Bing/ChatGPT search
- [PageSpeed Insights](https://pagespeed.web.dev) — Core Web Vitals
- [Rich Results Test](https://search.google.com/test/rich-results) — JSON-LD validation
- [Schema.org Validator](https://validator.schema.org) — backup JSON-LD validator
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) — mobile rendering
- [IndexNow API](https://www.indexnow.org) — instant push to Bing/Yandex

## Bottom line

The code is half the work. This checklist is the other half. **A perfectly-built site with no Search Console submission ranks worse than a worse-built site with proper submission.** Run through Phase 1 during development, Phase 2 on launch day, then make Phases 3–6 part of a weekly habit.
