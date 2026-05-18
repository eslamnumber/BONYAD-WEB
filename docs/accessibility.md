# Accessibility — WCAG 2.2 AA

Accessibility is a hard requirement, not a polish step. Saudi users include screen-reader users, keyboard-only users, and users on slow devices. Google and AI search engines also reward accessible markup — the same structure that helps a screen reader helps a crawler.

## Target

**WCAG 2.2 AA** across every public and authenticated page. AAA where cheap (color contrast).

## Rules

1. **Semantic HTML first, ARIA second.** Use the right tag (`<button>`, `<nav>`, `<main>`, `<dialog>`) before reaching for `role="…"`. The first rule of ARIA: don't use ARIA.
2. **One `<h1>` per page**, hierarchical headings, no skipped levels. Already required by SEO — same rule.
3. **Keyboard parity.** Every interactive element reachable via `Tab`, operable via `Enter`/`Space`, dismissible via `Esc` where modal. No mouse-only behavior.
4. **Visible focus rings.** Use the `--color-ring` token; never `outline: none` without a replacement. shadcn defaults already comply — don't override.
5. **Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI**. Tokens are pre-checked. New tokens added to `tokens.css` must include a contrast comment.
6. **Every form input has a real `<label>`.** `placeholder` is not a label. shadcn `<FormLabel>` enforces this.
7. **Every image has descriptive `alt`.** Decorative → `alt=""`. Already required for SEO — same rule.
8. **Announce route changes.** App Router does not move focus on navigation. Use a `<RouteAnnouncer>` (below) mounted in the root layout.
9. **Respect `prefers-reduced-motion`.** Disable non-essential animation. Tailwind: `motion-safe:`/`motion-reduce:` variants.
10. **Touch targets ≥ 44×44 CSS pixels** (WCAG 2.5.5). Use the spacing scale to enforce.

## Route-change announcer

```tsx
// components/feedback/route-announcer.tsx
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function RouteAnnouncer() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.textContent = document.title;
  }, [pathname]);
  return <div ref={ref} role="status" aria-live="polite" className="sr-only" />;
}
```

Also move focus to `<h1>` on route change (or to a `<main tabIndex={-1}>` ref). Without it, screen-reader users hear the old context after every nav.

## RTL + a11y

- `lang` and `dir` set on `<html>`. Already covered in [i18n-and-rtl.md](i18n-and-rtl.md).
- Don't lie about direction with `transform: scaleX(-1)` on text — use `<DirectionalIcon />` only for true directional glyphs (arrows, chevrons).
- `aria-label` strings come from i18n, not hardcoded English.

## Patterns by component

| Component        | Pattern                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Modal/dialog     | shadcn `<Dialog>` (Radix). Focus trap + restore + `Esc` close are built in.                                          |
| Menu / dropdown  | Radix `<Menu>` via shadcn. Roving tabindex built in.                                                                 |
| Toast            | `role="status"` for info, `role="alert"` for error.                                                                  |
| Form errors      | `aria-describedby` on the input pointing to `<FormMessage>` (shadcn does this).                                      |
| Icon-only button | Always has `aria-label={t('…')}`.                                                                                    |
| Loading spinner  | Wrapped in `role="status"` with a translated `<span className="sr-only">{t('common.loading')}</span>`.               |
| Skip link        | `<a href="#main" className="sr-only focus:not-sr-only">{t('a11y.skipToMain')}</a>` as the first element in `<body>`. |

## Testing

- **Unit/component**: `jest-axe` (or `vitest-axe`) on every component test. Zero violations is the pass bar.
- **E2E**: an `@axe-core/playwright` audit step in each Playwright spec — assertion on critical user journeys.
- **CI**: `pa11y-ci` against the running app on 5–10 key public URLs. Fail on new violations.
- **Manual** (every release): screen reader pass with VoiceOver on macOS Safari and NVDA on Windows Firefox. Try the login → create-project → bid flow end-to-end without a mouse.

```ts
// example assertion in a Vitest component test
import { axe } from 'vitest-axe';
const { container } = renderWithProviders(<TechnicianCard tech={fixture} />);
expect(await axe(container)).toHaveNoViolations();
```

## CI gate

```js
// pnpm test:a11y
"scripts": {
  "test:a11y": "pa11y-ci --sitemap http://localhost:3000/sitemap.xml --sitemap-find https://bonyad-hub.com --sitemap-replace http://localhost:3000"
}
```

PR fails if `pa11y-ci` reports any new error.

## Why a11y matters for SEO and AI search

- **Google** uses semantic structure as a ranking signal. `<h1>`, list semantics, table semantics → richer snippets.
- **Perplexity / ChatGPT / Claude** parse the same DOM a screen reader reads. Stronger landmarks → better extraction → more citations.
- **Voice assistants** (Google Assistant, Bixby) rely on `<h1>` + `Speakable` schema + clean paragraphs. See [seo-and-ai-readability.md](seo-and-ai-readability.md).

## Per-screen checklist additions

Already in [new-screen-checklist.md](new-screen-checklist.md) section I, but specifically:

- [ ] `jest-axe`/`vitest-axe` test added for any new component with logic.
- [ ] Keyboard pass: every interactive element reachable, visible focus.
- [ ] Screen-reader pass on the primary journey.
- [ ] `prefers-reduced-motion` honored on any animation added.
- [ ] Touch targets ≥ 44×44 verified in the small-mobile preview.
