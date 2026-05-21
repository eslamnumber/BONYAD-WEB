# New screen checklist

Use this every time you add a screen. Treat it as a PR review checklist.

## A. Plan

0. **Declare the phase plan** per [task-workflow.md](task-workflow.md). Phase 0 is mandatory before any code is written.
1. **Does this screen belong to an existing feature?** If yes, work inside `features/<existing>/`. If no, create `features/<new-feature>/` with the standard subfolders.
2. **Read the Figma frame end-to-end across two walks: shallow in Phase 0.5, deep in Phase 5 — NOT the screenshot** ([figma-to-code.md](figma-to-code.md) §The contract + [figma-layer-walk.md](figma-layer-walk.md)).
   - **Phase 0** — call `get_metadata` on the top frame to enumerate every section as a node ID **with a tentative risk score** (HIGH/MEDIUM/LOW per [section-risk-scoring.md](section-risk-scoring.md), from metadata signals only).
   - **Phase 0.5** — depth-1 shallow walk: one `get_design_context` per section root, all in one parallel message ([parallel-execution.md](parallel-execution.md) §Phase 0.5). Confirm or promote each risk score; sub-sub-phase HIGH sections; seed the **background-layer registry**; produce the file / endpoint / token / asset / parallel-dispatch lists.
   - **Phase 5 sub-phase** — deep recursive BFS to every leaf: every non-leaf node (FRAME/GROUP/INSTANCE/COMPONENT/SECTION/BOOLEAN_OPERATION) gets its own `get_design_context` call. Section root is a cache hit from Phase 0.5 — not re-fetched. Sibling fetches at the same depth run in **parallel** (sequential siblings are a defect). Walk every layer including every background layer (section fill, gradients, blur blobs, decorative shapes, image fills); append backgrounds to the registry. Pair each layer with a planned DOM element (kept / inlined / dropped).
   - **Completeness gate** — `total_nodes_visited + leaf_count >= metadata.descendant_count` must pass before any JSX.
   - **Screenshot is BANNED** as a code-derivation source.
   - Phase 0.5 also lists every interactive state (loading/empty/error/success), every icon to export, every background image to export to `public/images/bg/`, every Lottie/asset, every prototype transition.

2a. **Produce the leaf pixel ledger** ([figma-layer-walk.md](figma-layer-walk.md) §Leaf pixel ledger) for the section being built, before any JSX. Flat per-leaf table of `leaf_id → property → value → source`. **Every CSS value in the JSX must trace back to a ledger row** — this is the pixel-perfect contract. The 5-axis gate's computed-styles check is verified against the ledger, not eyeballed. 3. **List the API endpoints needed.** Add any missing entries to `config/endpoints.ts` (matching `website-bonyad/src/config/api.ts` in the RN app — RN is reference for the integration only, not for UI).
3-data. **Classify every enumerated section as static or backend-driven** per [section-data-classification.md](section-data-classification.md). For each backend-driven section, name the endpoint, the RN call site, the fetch site (RSC + prop for public/SEO pages, hook for interactive/authenticated pages), and confirm Phases 1 + 2 (schema + fetcher + sibling test) happen before that section's Phase 5 sub-phase. Hardcoding a backend entity (plans, services, testimonials, blog posts, FAQ, stats, featured items) is review-blocking — even as a placeholder.
3a. **Export all icons from Figma to `src/components/icons/`** with `currentColor` fills/strokes. No invented icons. No `lucide-react` for designed icons.
3b. **Export Lottie JSONs** for any complex animation to `public/animations/`. Simple transitions stay as Tailwind/Framer per the Figma transition metadata.

## B. Schemas and types

4. **Add zod schemas** for request and response in `features/<f>/schemas/`. Derive TS types with `z.infer`.
5. **Add a `<feature>` query-key factory** if it doesn't exist.

## C. API hooks

6. **Create one file per endpoint** in `features/<f>/api/`. Each file exports the fetcher, the query-key entry, and the hook.
7. **Run `pnpm typecheck`** — no `any`, no implicit `unknown`.

## D. Route and page

8. **Add the route file** under `app/(app)/<path>/page.tsx`. The route does only: set `metadata`, render the feature's screen component.
9. **Add the route to `config/routes.ts`.** No raw path strings in `next/link` `href` props.
10. **Add an `error.tsx` and `loading.tsx`** for the route segment if not inherited.

## E. Components

11. **Build the screen component** in `features/<f>/components/`. Pages stay thin.
12. **Compose from `components/ui/` primitives.** Add new shadcn primitives via `pnpm dlx shadcn add <component>` — never build from scratch when a shadcn equivalent exists.
13. **Every visible string lives in `locales/en.json` + `locales/ar.json`.** Run the i18n key checker.
14. **Every color, font, radius, spacing comes from a token.** No literals.
15. **Use logical Tailwind utilities** (`ms-*`, `ps-*`, `start-*`, `text-start`). No physical.
16. **Render all four states**: pending (`<LoadingState />`), error (`<ErrorState />`), empty (`<EmptyState />`), success.

## F. Forms (if applicable)

17. **Schema in `schemas/`, form in `components/`, mutation in `api/`.**
18. **Wire field errors from `mutation.onError` to `form.setError`.**
19. **Submit button disabled when `mutation.isPending`.**
20. **Validation messages are i18n keys**, translated at render time.

## G. Auth and authorization

21. **If the screen is authenticated**, place it under `app/(app)/` — middleware enforces auth.
22. **Role-gate at the screen level** with `<RoleGate roles={['TECHNICIAN']}>` from `features/auth/`. Don't sprinkle role checks inside random child components.

## H. Tests

23. **Unit tests** for any non-trivial component logic and all zod schemas.
24. **An MSW handler** for every endpoint the screen calls, in `testing/handlers/`.
25. **One Playwright spec** for the happy path of the screen, if it's a primary user journey.

## I. Quality gates

26. **`pnpm lint`** passes — including boundary rules and file-size limits.
27. **`pnpm typecheck`** passes — strict mode.
28. **`pnpm test`** passes.
29. **Manual check in browser, per section, five axes**. For every section of the screen, run the full quintet before moving to the next one — never batch at end-of-screen. See [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification.
    - **Layer fidelity**: every Figma layer that was planned to render (content AND backgrounds — section fills, gradients, blur blobs, decorative shapes, image fills) has a matching DOM element; every "dropped" layer is absent; no extra wrappers without a documented reason; no JSX value that traces back to a screenshot rather than a layer property. **Every background-layer registry row appended in Phases 0.5 + 5 corresponds to a visible element in the rendered page** — a registry row with no DOM correspondence is a silent drop.
    - **Pixel-perfect (light, `en`)**: **inspect computed styles against the leaf pixel ledger** (not eyeballed against Figma). Every leaf × property pair (padding, gap, font size, line-height, color, radius, icon size, section background fill, gradient stops + angle, decorative blur blob positions, background images) must match the ledger 1:1. A computed style with no ledger row OR a ledger row whose value differs from computed style — both are defects. Background images must be real exports from Figma under `public/images/bg/`, not CSS gradients substituting for image fills.
    - **RTL mirror (`ar`)**: toggle the `bonyad-lang` cookie to `ar`, reload, confirm `<html dir="rtl">` and that the section mirrors. Same physical side in both locales = `-end` used where `-start` was needed ([i18n-and-rtl.md](i18n-and-rtl.md) §Common mistake).
    - **Dark mode**: switch the theme toggle to dark; every surface (including background layers) must come from a token with a `.dark` value in [src/styles/tokens.css](../src/styles/tokens.css). Wash-out / black-on-black = a missing `.dark` override. Fix before continuing.
    - **Responsive (12-width matrix: 320 / 375 / 414 / 600 / 768 / 900 / 1024 / 1100 / 1280 / 1366 / 1440 / 1920)** per [responsive-verification.md](responsive-verification.md): no horizontal scroll, no clipped content, touch targets ≥ 44 px at widths ≤ 768, no overlap, structural columns visible (stacked, never `hidden`) at every width. No `w-[\d+px]` / `h-[\d+px]` on layout containers; decorative absolute-positioned background elements with hardcoded coordinates gated behind `xl:` ([responsive-design.md](responsive-design.md) §Hard rules). Between-breakpoint widths (900, 1100, 1366) are first-class — they catch the most common real regressions on this project.
    - **Data classification (backend-driven sections only)**: endpoint consumed matches the Phase 0 plan; fetched in the agreed site (RSC + typed prop for public/SEO pages, hook for interactive/authenticated pages); pending / error / empty / success states all rendered (empty via locale copy, not a hardcoded array); localised fields read via `LOCALE_DIRECTION[locale]`, never `locale === 'ar'`; no hardcoded fallback array anywhere in the component. See [section-data-classification.md](section-data-classification.md).
30. **Accessibility pass** (see [accessibility.md](accessibility.md)): every form has labels, every image has alt text, every interactive element is keyboard-reachable, focus rings visible (using `--color-ring` token), `vitest-axe` test added for non-trivial components, route-change announcer hits.

## J. SEO (public pages only — skip for authenticated routes)

If this screen is **publicly accessible** (no auth wall), complete the per-page SEO checklist from [seo-and-ai-readability.md](seo-and-ai-readability.md):

31. **Page is a Server Component** at the route level — data fetched on the server, not via client-side TanStack Query.
32. **`generateMetadata`** exported with title (<60 chars), description (140–160), canonical, OG image, `alternates.languages` for `en` + `ar`. `metadataBase` already set in root layout.
33. **JSON-LD structured data** rendered via `<JsonLd>` (HTML-escaped + CSP nonce — see [security-headers.md](security-headers.md)) with the right schema.org type. `LocalBusiness`/`Speakable` where applicable.
34. **Single `<h1>`** at the top of `<main>` containing the primary keyword.
35. **All images use `next/image`** with descriptive `alt` text.
36. **Page added to `sitemap.ts`** (or auto-included via dynamic generation).
37. **`revalidate` set** if content updates on a schedule (ISR); `generateStaticParams` if popular dynamic routes can be pre-built. See [caching-and-runtime.md](caching-and-runtime.md).
    37a. **Tag-based invalidation wired** (`revalidateTag('<entity>:<id>')`) when the backend publishes/edits the entity.
    37b. **≥2 in-content links** to related public pages (not just nav). See [seo-and-ai-readability.md](seo-and-ai-readability.md) §4b.

If this screen is **private** (behind auth):

38. **`metadata.robots = { index: false, follow: false }`** so it never appears in search.

## K. Final

39. **Update `locales/*.json` for both languages**, even if the Arabic strings need product review — never ship `en` alone.
40. **No `console.log`, no `TODO` without an issue link**, no commented-out code.
41. **Docs in sync.** Per [doc-maintenance.md](doc-maintenance.md), every new feature folder, endpoint, token, icon, env var, or shared component has the matching doc edit in this PR. The PR description carries a "Doc updates" line naming the files touched (or stating "no doc update required" with a reason).

## Definition of done

A screen is done when all boxes are checked **and** at least one other engineer has reviewed it against this checklist. If a box can't be checked, document why in the PR description.
