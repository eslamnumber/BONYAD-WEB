import { Inter_Tight, Noto_Sans_Arabic } from 'next/font/google';

/**
 * Font loaders for the app — the ONLY place that names a specific font.
 *
 * Extracted from the Figma design system (Bonyad V1, file rOfcixsPRWdS7BdkpElS4Q):
 *   - Latin / English  → Inter Tight (Display, Headline, Body, Label, Title styles)
 *   - Arabic           → Noto Sans Arabic
 *
 * To swap to a different font, change ONE file (this one):
 *   1. Update the `import` line to bring in the new loader from `next/font/google`
 *      (or use `next/font/local` for a local .woff2 file).
 *   2. Update the constructor call below — `Inter_Tight({...})` → `Geist({...})`, etc.
 *
 * The exported names (`sansFont`, `arabicFont`) and CSS variable names
 * (`--font-sans-primary`, `--font-arabic-primary`) stay constant, so nothing
 * else in the codebase needs to change.
 */

export const sansFont = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-primary',
  weight: ['400', '500', '600', '700'],
});

export const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic-primary',
  weight: ['300', '400', '500', '600', '700'],
});
