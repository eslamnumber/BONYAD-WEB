import { describe, expect, it } from 'vitest';

import { buildLocalSow } from './build-local-sow';

describe('buildLocalSow', () => {
  it('maps raw answers into a minimal SOW (budget→grand_total, duration→weeks, location split)', () => {
    const sow = buildLocalSow({
      project_name: 'تشطيب شقة',
      description: 'تشطيب كامل',
      property_area: 'شقة 120 متر',
      location: 'الرياض، النرجس',
      quality_tier: 'luxury',
      budget: '80,000 ريال',
      duration_days: '56',
    });
    expect(sow.project_metadata?.project_name).toBe('تشطيب شقة');
    expect(sow.project_metadata?.quality_tier).toBe('A+');
    expect(sow.project_metadata?.location).toEqual({ city: 'الرياض', district: 'النرجس' });
    expect(sow.timeline?.duration_weeks).toBe(8);
    expect(sow.commercials?.cost_breakdown?.grand_total).toEqual({ min: 80000, max: 80000 });
  });

  it('omits commercials when budget is absent or open', () => {
    const sow = buildLocalSow({ project_name: 'ترميم', duration_days: '7' });
    expect(sow.commercials).toBeUndefined();
    expect(sow.timeline?.duration_weeks).toBe(1);
  });
});
