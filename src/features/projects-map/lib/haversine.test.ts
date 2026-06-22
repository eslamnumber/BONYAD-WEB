import { describe, expect, it } from 'vitest';

import { haversineKm } from './haversine';

describe('haversineKm', () => {
  it('returns ~0 for the same point', () => {
    expect(haversineKm(24.71, 46.67, 24.71, 46.67)).toBeCloseTo(0, 1);
  });

  it('measures Riyadh → Jeddah as ~850 km', () => {
    const d = haversineKm(24.7136, 46.6753, 21.4858, 39.1925);
    expect(d).toBeGreaterThan(840);
    expect(d).toBeLessThan(860);
  });

  it('a 5 km offset measures ~5 km', () => {
    // ~0.045 degrees latitude ≈ 5 km
    const d = haversineKm(24.71, 46.67, 24.71 + 0.045, 46.67);
    expect(d).toBeGreaterThan(4.5);
    expect(d).toBeLessThan(5.5);
  });
});
