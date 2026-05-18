# New screen checklist

Use this every time you add a screen. Treat it as a PR review checklist.

## A. Plan

0. **Declare the phase plan** per [task-workflow.md](task-workflow.md). Phase 0 is mandatory before any code is written.
1. **Does this screen belong to an existing feature?** If yes, work inside `features/<existing>/`. If no, create `features/<new-feature>/` with the standard subfolders.
2. **Read the Figma frame end-to-end** ([figma-to-code.md](figma-to-code.md)). **Enumerate every section as a node ID** and call `get_design_context` per section — do not work from a single top-frame response that may have been truncated. List every interactive state (loading/empty/error/success), every icon to export, every Lottie/asset needed, every prototype transition.
3. **List the API endpoints needed.** Add any missing entries to `config/endpoints.ts` (matching `website-bonyad/src/config/api.ts` in the RN app — RN is reference for the integration only, not for UI).
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
29. **Manual check in browser**: light mode, dark mode, English, Arabic. Note that this project intentionally inverts the direction mapping (`en → rtl`, `ar → ltr` — see [i18n-and-rtl.md](i18n-and-rtl.md) §Direction mapping), so `en` should render with `<html dir="rtl">` and `ar` with `<html dir="ltr">`. For each section, **inspect computed styles** (padding, gap, font size, color, radius, icon size) and compare 1:1 against Figma — see [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification. When toggling locales, every section must mirror; content anchored to the same physical side across both locales means a `-end` utility that should be `-start` ([i18n-and-rtl.md](i18n-and-rtl.md) §Common mistake).
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

## Definition of done

A screen is done when all boxes are checked **and** at least one other engineer has reviewed it against this checklist. If a box can't be checked, document why in the PR description.
