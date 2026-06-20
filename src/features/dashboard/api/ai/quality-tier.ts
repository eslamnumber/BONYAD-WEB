import type { QualityTier } from './sow-types';

const TIERS: QualityTier[] = ['B', 'B+', 'A', 'A+'];

/** A value already in canonical tier form passes straight through. */
export function isQualityTier(value: string | undefined): value is QualityTier {
  return !!value && (TIERS as string[]).includes(value);
}

/** Substring → tier table, ordered most-specific first (A+ before A, B+ before B). */
const TIER_MATCHERS: { needles: string[]; tier: QualityTier }[] = [
  { needles: ['a+', 'luxury', 'فاخر'], tier: 'A+' },
  { needles: ['b+', 'standard', 'قياسي'], tier: 'B+' },
  { needles: ['a', 'premium', 'مميز'], tier: 'A' },
  { needles: ['b', 'economy', 'اقتصادي'], tier: 'B' },
];

/**
 * Free-text quality answer → one of `B` / `B+` / `A` / `A+`. Mirrors iOS
 * `normalizeQualityTier`: matched substrings (most-specific first) map economy/
 * standard/premium/luxury in both languages; an unrecognised value passes through
 * unchanged so the backend can still interpret it.
 */
export function normalizeQualityTier(raw: string | undefined): string {
  const v = (raw ?? '').trim().toLowerCase();
  if (!v) return '';
  const hit = TIER_MATCHERS.find((m) => m.needles.some((n) => v.includes(n)));
  return hit ? hit.tier : (raw ?? '');
}
