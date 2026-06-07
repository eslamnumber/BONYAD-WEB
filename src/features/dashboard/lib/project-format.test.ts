import { describe, expect, it } from 'vitest';

import {
  daysRemaining,
  durationWeeks,
  formatBudgetCompact,
  localizedServiceName,
} from './project-format';

describe('formatBudgetCompact', () => {
  it('formats to compact K / M figures', () => {
    expect(formatBudgetCompact(200000)).toBe('200K');
    expect(formatBudgetCompact(800000)).toBe('800K');
    expect(formatBudgetCompact(3000000)).toBe('3M');
    expect(formatBudgetCompact(1500000)).toBe('1.5M');
  });

  it('returns null when the budget is absent', () => {
    expect(formatBudgetCompact(null)).toBeNull();
    expect(formatBudgetCompact(undefined)).toBeNull();
  });
});

describe('durationWeeks', () => {
  it('ceils days into whole weeks (mirrors the RN formula)', () => {
    expect(durationWeeks(84)).toBe(12);
    expect(durationWeeks(14)).toBe(2);
    expect(durationWeeks(10)).toBe(2);
    expect(durationWeeks(7)).toBe(1);
  });

  it('returns null when the duration is absent', () => {
    expect(durationWeeks(null)).toBeNull();
    expect(durationWeeks(undefined)).toBeNull();
  });
});

describe('localizedServiceName', () => {
  const PAIR = { serviceNameEn: 'Construction', serviceNameAr: 'البناء والتشطيب' };

  it('picks per locale via the inverted direction mapping', () => {
    expect(localizedServiceName(PAIR, 'ar')).toBe('البناء والتشطيب');
    expect(localizedServiceName(PAIR, 'en')).toBe('Construction');
  });

  it('falls back to the other side when one is missing', () => {
    expect(localizedServiceName({ serviceNameEn: 'Construction' }, 'ar')).toBe('Construction');
    expect(localizedServiceName({ serviceNameAr: 'بناء' }, 'en')).toBe('بناء');
  });

  it('returns undefined when neither side is present', () => {
    expect(localizedServiceName({}, 'ar')).toBeUndefined();
    expect(localizedServiceName({ serviceNameEn: '   ' }, 'en')).toBeUndefined();
  });
});

describe('daysRemaining', () => {
  it('returns whole days until a future deadline', () => {
    const future = new Date(Date.now() + 10 * 86_400_000).toISOString();
    expect(daysRemaining(future)).toBe(10);
  });

  it('returns null for past, missing, or invalid deadlines', () => {
    expect(daysRemaining(new Date(Date.now() - 86_400_000).toISOString())).toBeNull();
    expect(daysRemaining(null)).toBeNull();
    expect(daysRemaining(undefined)).toBeNull();
    expect(daysRemaining('not-a-date')).toBeNull();
  });
});
