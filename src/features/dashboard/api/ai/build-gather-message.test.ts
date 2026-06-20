import { describe, expect, it } from 'vitest';

import { buildGatherMessage, durationDaysToWeeks } from './build-gather-message';

describe('durationDaysToWeeks', () => {
  it('ceils days to weeks with a minimum of 1', () => {
    expect(durationDaysToWeeks('56')).toBe(8);
    expect(durationDaysToWeeks('10')).toBe(2);
    expect(durationDaysToWeeks('3')).toBe(1);
    expect(durationDaysToWeeks('')).toBe(1);
    expect(durationDaysToWeeks(undefined)).toBe(1);
  });
});

describe('buildGatherMessage', () => {
  it('packs answers into the locked Arabic format with City→District split', () => {
    const msg = buildGatherMessage({
      project_name: 'تشطيب شقة',
      property_area: 'شقة 120 متر',
      description: 'تشطيب كامل',
      location: 'الرياض، النرجس',
      quality_tier: 'premium',
      budget: '80000',
      duration_days: '56',
    });
    expect(msg).toBe(
      'تشطيب شقة لشقة 120 متر، تشطيب كامل، في النرجس بالرياض، مستوى الجودة A، ميزانية 80000 ريال، أريد إنجاز خلال 8 أسابيع',
    );
  });

  it('falls back to "ميزانية مفتوحة" when budget is missing and drops empty optionals', () => {
    const msg = buildGatherMessage({
      project_name: 'ترميم',
      description: 'ترميم سباكة',
      location: 'جدة',
      duration_days: '7',
    });
    expect(msg).toContain('ميزانية مفتوحة');
    expect(msg).toContain('في جدة');
    expect(msg).toContain('أريد إنجاز خلال 1 أسابيع');
    expect(msg).not.toContain('مستوى الجودة');
  });
});
