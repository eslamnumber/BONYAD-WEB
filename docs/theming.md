# Theming — no hardcoded colors or fonts

## Tokens live in ONE place

`src/styles/tokens.css` defines every design token as a CSS variable, in both `:root` (light) and `.dark` (dark). Tailwind v4 reads them via `@theme inline`:

```css
/* tokens.css */
@import 'tailwindcss';

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --font-sans: var(--font-sans-stack);
  --font-arabic: var(--font-arabic-stack);
  --radius: var(--radius);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0 0);
  --primary: oklch(0.41 0.13 243); /* #00549b */
  --primary-foreground: oklch(0.98 0 0);
  /* … */
  /* Font FAMILIES are named ONLY in src/lib/fonts.ts (Inter Tight + Noto Sans Arabic),
     which exposes them as --font-sans-primary / --font-arabic-primary. tokens.css just
     builds the stacks — never hardcode a family name here either. */
  --font-sans-stack: var(--font-sans-primary), system-ui, -apple-system, sans-serif;
  --font-arabic-stack: var(--font-arabic-primary), system-ui, sans-serif;
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.14 0 0);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.65 0.15 243); /* lighter #00549b for dark backgrounds */
  /* … */
}
```

> The snippet above is illustrative. The **real, authoritative** values live in
> [`src/styles/tokens.css`](../src/styles/tokens.css) (colors/radius/motion) and
> [`src/lib/fonts.ts`](../src/lib/fonts.ts) (the only place font families are named:
> **Inter Tight** for Latin, **Noto Sans Arabic** for Arabic). See the full identity
> inventory in [`docs/design/BONYAD_DESIGN_IDENTITY.md`](design/BONYAD_DESIGN_IDENTITY.md).

## Rules

1. **No hex / rgb / hsl literals in components.** Only inside `tokens.css`. **ESLint-enforced** — a hardcoded color in a Tailwind color-utility arbitrary value (`bg-[#…]`, `text-[rgb(…)]`, …) is a build error (`eslint.config.mjs` → `no-restricted-syntax`). The one exception is `shadow-[…rgba…]`, since shadows are not tokenized.
2. **No hardcoded font-family strings.** Families are named ONLY in [`src/lib/fonts.ts`](../src/lib/fonts.ts); components use the `font-sans` / `font-arabic` Tailwind utilities. **ESLint-enforced** — an inline `fontFamily` is a build error except in the framework files that render outside Tailwind (`ImageResponse` icons / `global-error`), which carry a documented `eslint-disable` with a reason.
3. **Every color used in the UI must have a token.** If you need a one-off color, add a token first.
4. **Token names are semantic, not literal.**
   - ✅ `--color-primary`, `--color-destructive`, `--color-muted`
   - ❌ `--color-blue-500`, `--color-red`
     Literal scales are only allowed when building the semantic layer.
5. **Component variants live in shadcn's `cva()` definitions**, not as ad-hoc Tailwind strings repeated everywhere.
6. **Dark mode is owned by `next-themes`.** `<ThemeProvider attribute="class" defaultTheme="system">` in the root layout. Components never read or set the theme directly — they use Tailwind classes that respond to `.dark`.
7. **Every token defined in `:root` MUST also be defined in `.dark`.** No exceptions. A token without a `.dark` value renders the same light-mode color under dark mode, producing washed-out cards, black-on-black text, or invisible icons. PR review must reject any new `:root` token that does not have a matching `.dark` entry. This is the #1 dark-mode regression cause in this codebase — treat it as a hard rule, not a nice-to-have.
8. **No `dark:` Tailwind variants in shared components** when the same token covers both modes. `bg-background` already flips automatically. Only use `dark:` when light and dark genuinely diverge in a way the token can't capture.
9. **Spacing, radii, shadows are also tokens.** No `style={{ padding: 13 }}`. Use the Tailwind scale.

### Verification gate for tokens

Every PR that adds or modifies a `:root` token must include, in the PR description or a verification screenshot, that the section using the token was visually checked in **both** light and dark mode — see [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification, axis 3. If you cannot verify dark mode (e.g. token only applies to a state you can't reach), say so explicitly in the PR — silent skips are not allowed.

## Fonts

The app's two pinned fonts, extracted from the Figma design system:

| Locale          | Font                 | Variable                | Source                                                                                         |
| --------------- | -------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| Latin / English | **Inter Tight**      | `--font-sans-primary`   | Figma "Static/\_/Font" variables in `Display`, `Headline`, `Body`, `Label`, `Title` style sets |
| Arabic          | **Noto Sans Arabic** | `--font-arabic-primary` | Figma text instances containing Arabic content                                                 |

Both are loaded via `next/font/google` in `src/lib/fonts.ts` and applied to `<html>` as CSS variables in `src/app/layout.tsx`. **Never hardcode a font-family in JSX or CSS** — read from the tokens `var(--font-sans)` / `var(--font-arabic)` via the Tailwind utilities `font-sans` / `font-arabic`.

To swap fonts later, edit ONLY `src/lib/fonts.ts` (one file, two adjacent lines — import + constructor). The exported names `sansFont` / `arabicFont` and the CSS variable names stay constant, so the rest of the codebase doesn't need to change.

- Load fonts via `next/font` in `app/layout.tsx`. Export them as CSS variables on `<html>`.
- The Arabic font is applied automatically when `<html lang="ar">`:
  ```css
  :root {
    font-family: var(--font-sans);
  }
  :lang(ar) {
    font-family: var(--font-arabic);
  }
  ```

## Dark mode toggle

The toggle lives in `components/layout/theme-toggle.tsx` and uses `useTheme` from `next-themes`. It must:

- Render a sun/moon icon from `lucide-react`.
- Cycle `light → dark → system → light`.
- Have an accessible label (`aria-label={t('theme.toggle')}`).
- Be keyboard-reachable.

### Animated theme transition

Every theme toggle routes its `setTheme` call through **`switchTheme(applyTheme)`** in `src/lib/theme-switch.ts` — never call `setTheme` directly from a toggle. `switchTheme` runs the change inside a **View Transition** and clip-path-reveals the new theme as a circle anchored at the **bottom-right corner of the screen**, growing to the viewport diagonal so it sweeps to the opposite (top-left) corner. The three call sites are `theme-toggle.tsx`, `profile-controls.tsx` (`DarkModeRow`), and `sidebar-settings-menu.tsx`.

- The new theme commits via `flushSync` so the captured "new" snapshot already reflects it.
- Progressive enhancement: no View Transitions support (Firefox), no origin, or `prefers-reduced-motion` → the theme applies instantly with the same end state.
- The pseudo-element CSS lives behind `html[data-theme-shift]` in `globals.css` (kills the default cross-fade, stacks the new snapshot on top). It is **scoped** so it never collides with the locale push animation (`html[data-locale-shift]`, driven by `switchLocale`); both markers are set for the transition's duration only and cleared on `finished`.

## What to do if a Figma value isn't in tokens

1. Confirm with design that it's a deliberate new token, not an accident.
2. Add the token to `tokens.css` with light + dark values.
3. Add the Tailwind mapping in `@theme inline`.
4. Use it in the component via the Tailwind utility.

Never inline the hex code "temporarily."
