import { describe, expect, it } from 'vitest';

import { isQualityTier, normalizeQualityTier } from './quality-tier';

describe('normalizeQualityTier', () => {
  it('maps Arabic and English free text to canonical tiers (most-specific first)', () => {
    expect(normalizeQualityTier('luxury finish')).toBe('A+');
    expect(normalizeQualityTier('فاخر')).toBe('A+');
    expect(normalizeQualityTier('A+')).toBe('A+');
    expect(normalizeQualityTier('premium')).toBe('A');
    expect(normalizeQualityTier('مميز')).toBe('A');
    expect(normalizeQualityTier('standard')).toBe('B+');
    expect(normalizeQualityTier('قياسي')).toBe('B+');
    expect(normalizeQualityTier('economy')).toBe('B');
    expect(normalizeQualityTier('اقتصادي')).toBe('B');
  });

  it('passes an unrecognised value through and handles empties', () => {
    expect(normalizeQualityTier('غير معروف')).toBe('غير معروف');
    expect(normalizeQualityTier('')).toBe('');
    expect(normalizeQualityTier(undefined)).toBe('');
  });
});

describe('isQualityTier', () => {
  it('accepts only the four canonical tiers', () => {
    expect(isQualityTier('A+')).toBe(true);
    expect(isQualityTier('B')).toBe(true);
    expect(isQualityTier('premium')).toBe(false);
    expect(isQualityTier(undefined)).toBe(false);
  });
});
