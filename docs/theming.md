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
  --font-sans: var(--font-sans);
  --font-arabic: var(--font-arabic);
  --radius: var(--radius);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0 0);
  --primary: oklch(0.55 0.2 250);
  --primary-foreground: oklch(0.98 0 0);
  /* … */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-arabic: 'IBM Plex Sans Arabic', system-ui, sans-serif;
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.98 0 0);
  --primary: oklch(0.7 0.2 250);
  /* … */
}
```

## Rules

1. **No hex / rgb / hsl literals in components.** Only inside `tokens.css`.
2. **No hardcoded font-family strings outside `tokens.css`.** Use `font-sans` or `font-arabic` Tailwind utilities.
3. **Every color used in the UI must have a token.** If you need a one-off color, add a token first.
4. **Token names are semantic, not literal.**
   - ✅ `--color-primary`, `--color-destructive`, `--color-muted`
   - ❌ `--color-blue-500`, `--color-red`
     Literal scales are only allowed when building the semantic layer.
5. **Component variants live in shadcn's `cva()` definitions**, not as ad-hoc Tailwind strings repeated everywhere.
6. **Dark mode is owned by `next-themes`.** `<ThemeProvider attribute="class" defaultTheme="system">` in the root layout. Components never read or set the theme directly — they use Tailwind classes that respond to `.dark`.
7. **No `dark:` Tailwind variants in shared components** when the same token covers both modes. `bg-background` already flips automatically. Only use `dark:` when light and dark genuinely diverge.
8. **Spacing, radii, shadows are also tokens.** No `style={{ padding: 13 }}`. Use the Tailwind scale.

## Fonts

The app's two pinned fonts, extracted from the Figma design system:

| Locale | Font | Variable | Source |
|---|---|---|---|
| Latin / English | **Inter Tight** | `--font-sans-primary` | Figma "Static/_/Font" variables in `Display`, `Headline`, `Body`, `Label`, `Title` style sets |
| Arabic | **Noto Sans Arabic** | `--font-arabic-primary` | Figma text instances containing Arabic content |

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

## What to do if a Figma value isn't in tokens

1. Confirm with design that it's a deliberate new token, not an accident.
2. Add the token to `tokens.css` with light + dark values.
3. Add the Tailwind mapping in `@theme inline`.
4. Use it in the component via the Tailwind utility.

Never inline the hex code "temporarily."
