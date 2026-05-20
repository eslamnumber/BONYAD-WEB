# Section data classification — static vs backend-driven

Figma frames mix two kinds of section content: **static** (copy/typography/imagery that lives in the design and translation files) and **backend-driven** (data the backend owns — plans, services, technicians, testimonials, blog posts, FAQ entries, stats, anything keyed by an entity ID). The two are built differently. Treating a backend-driven section as static — hardcoding the array of "plans" or "services" into the component — is a defect, even if the Figma frame shows fixed-looking content.

This doc is the binding rule for that classification. It's invoked from [task-workflow.md](task-workflow.md) §Section sub-phasing, [figma-to-code.md](figma-to-code.md), and [new-screen-checklist.md](new-screen-checklist.md).

## Why this rule exists

Figma shows a snapshot. The product ships a database. The "Pro pricing" cards a designer renders are not three plans forever — they're whatever `/subscriptions/categories` returns today. Hardcoding the snapshot couples the UI to a moment in time, silently diverges from the RN app, hides backend-evolution bugs until production, and turns every plan/service/testimonial edit into a deploy. The web app must read the same backend the RN app reads — no exceptions, no "we'll wire it up later".

## When a section is backend-driven

A section is **backend-driven** if ANY of these is true:

1. The content shown is an instance of an entity the backend owns (subscription plan, service category, technician, project, blog post, success story, FAQ entry, stat counter, featured item, badge).
2. The legacy RN app at `website-bonyad/src/` fetches the same data from an endpoint in `website-bonyad/src/config/api.ts`. **Grep first** — if RN fetches it, web fetches it.
3. The content would conceivably change without a code deploy (price, plan name, feature list, count, ordering, availability, copy edited by a non-engineer in an admin panel).
4. The Figma frame contains a repeating card whose card count is editorial (3 plans today, 4 tomorrow) — repeating cards with editorial cardinality are almost always backend-driven.

A section is **static** only if ALL of these is true: the content is part of the brand/marketing copy, lives in `locales/en.json` + `locales/ar.json`, has a fixed cardinality dictated by the design (hero, trust strip, single-instance CTA, footer columns), and a copy edit is expected to ship via a translation-file change.

If you can't decide, the answer is **backend-driven**. Static is the rare branch.

## Concrete catalog (this project)

Known backend-driven sections in the Bonyad app — mirror the existing endpoint, never hardcode:

| Section                                  | Endpoint (`API_ENDPOINTS.*`)                   | RN reference                                        |
| ---------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Subscription / pricing plans             | `SUBSCRIPTIONS.CATEGORIES`                     | `website-bonyad/src/screens/` (search "categories") |
| Service categories                       | mirror from `website-bonyad/src/config/api.ts` | RN home / service-selection screens                 |
| Featured / verified technicians          | mirror from `website-bonyad/src/config/api.ts` | RN customer home screens                            |
| Success stories / testimonials           | mirror from `website-bonyad/src/config/api.ts` | RN marketing-adjacent screens                       |
| Blog posts / articles                    | mirror from `website-bonyad/src/config/api.ts` | RN content screens                                  |
| FAQ entries                              | mirror from `website-bonyad/src/config/api.ts` | RN support screens                                  |
| Stats / counters (jobs done, pros, etc.) | mirror from `website-bonyad/src/config/api.ts` | RN about / trust screens                            |

If the catalog row is blank, that is the gap the current task closes — grep `website-bonyad/` first, add the endpoint, then build.

## What Phase 0 must produce for each section

When walking a Figma frame in Phase 0 ([task-workflow.md](task-workflow.md)), every enumerated section gets a one-line classification:

```
5a) Hero — static (copy in locales/en.json + locales/ar.json, fixed cardinality)
5b) Pricing — backend-driven (endpoint: SUBSCRIPTIONS.CATEGORIES, schema: SubscriptionPlan, RN ref: website-bonyad/src/screens/...)
5c) Services grid — backend-driven (endpoint: TBD — grep website-bonyad first)
5d) Trust strip — static
```

Backend-driven sections require Phase 1 (schema) + Phase 2 (hook + test) **completed before** that section's Phase 5 sub-phase starts. The sub-phase consumes a fetched array, never a hardcoded one.

## The build pattern for a backend-driven section

For every backend-driven section:

1. **Confirm the RN call site.** Grep `website-bonyad/src/screens/` for the endpoint constant. Copy request body field names and response field reads verbatim. See [api-and-auth.md](api-and-auth.md) §Before adding any new endpoint integration.
2. **Mirror the endpoint** in `src/config/endpoints.ts` (must match `website-bonyad/src/config/api.ts` exactly — never drift).
3. **Permissive response type** in `src/features/<f>/schemas/<entity>.ts` — TS `type` with optional fields, not strict zod. See [api-and-auth.md](api-and-auth.md) §Schema strategy.
4. **One fetcher + hook + sibling test** in `src/features/<f>/api/<endpoint>.ts` + `<endpoint>.test.ts`. Test covers happy path, one 4xx mapped to `ApiError`, and every branching state. See [testing.md](testing.md) §Per-endpoint tests.
5. **Fetch in the RSC for public/SEO pages, pass as a prop.** For `app/(main)/**` and any page with `generateMetadata` + JSON-LD: call the fetcher in the page server component, swallow errors to `[]` (or to a sentinel), and pass the data to the section component as a typed prop. Pattern reference: `src/app/(main)/for-pros/page.tsx` → `<TechPricing plans={plans} />`. The section component stays a Server Component and renders four states (loading not needed under RSC fetch — `pending` is handled by Suspense / streaming if used).
6. **Use the TanStack Query hook for interactive / authenticated pages.** When the section lives in `(app)/` or needs client refetching (filters, polling, mutations), call the hook from a `'use client'` leaf. Render all four states (`pending` / `error` / `empty` / `success`) via `<DataState>`. See [state-management.md](state-management.md).
7. **Empty state is mandatory.** A zero-length result is not a crash — render the empty state with locale copy. Pattern reference: `tech-pricing.tsx` falls back to `t('tech.pricing.noPlans')` when `plans` is empty.
8. **No fake fallback data.** If the fetch fails, surface the empty/error state — do not hardcode a "default" plan / service / story to fill the gap. The hardcoded fallback is the bug you're trying to prevent.
9. **Localised fields ship with both languages.** Read `nameEn` / `nameAr` (or equivalent) via `LOCALE_DIRECTION[locale]` — never the locale string directly. See [i18n-and-rtl.md](i18n-and-rtl.md).

## What goes in the gate report

Every backend-driven section's Phase 5 sub-phase gate report ([task-workflow.md](task-workflow.md) §Phase gate) must include:

- **Endpoint consumed**: `API_ENDPOINTS.<NAMESPACE>.<KEY>`
- **Fetched in**: `RSC at <page path>` OR `client hook in <component>`
- **States rendered**: pending ✅ / error ✅ / empty ✅ / success ✅ (omit pending only when fetched in an RSC without Suspense)
- **No hardcoded fallback array**: confirmed ✅
- **Locale-aware field reads** (e.g. `nameEn`/`nameAr` picked via `LOCALE_DIRECTION`): confirmed ✅

If any row is missing or red, the section is not done — fix before the next sub-phase.

## Anti-patterns (review-blocking)

- `const PLANS = [{ name: 'Basic', price: 99 }, …]` in a component file. Backend-driven content must come from a fetcher.
- A section that renders backend data but accepts an inline array as a prop "as a placeholder until the API exists." If the API doesn't exist yet, the endpoint discovery and mirroring is part of the same PR — there is no placeholder phase.
- Falling back to a hardcoded list when the fetch fails. Render the empty/error state instead.
- Reading `locale === 'ar'` to pick `nameAr` vs `nameEn`. Always go through `LOCALE_DIRECTION` (the mapping is inverted — see [i18n-and-rtl.md](i18n-and-rtl.md) and CLAUDE.md rule 4).
- Drifting `src/config/endpoints.ts` from `website-bonyad/src/config/api.ts`. They must mirror exactly.
- A new endpoint mirrored on web that the RN app does not consume — backend changes for the web app's sake require a separate discussion ([api-and-auth.md](api-and-auth.md) §Before adding any new endpoint integration).
