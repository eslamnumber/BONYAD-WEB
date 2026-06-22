import { describe, expect, it } from 'vitest';

import {
  daysRemaining,
  durationWeeks,
  formatBudget,
  localizedServiceName,
  shortLocation,
} from './project-format';

describe('shortLocation', () => {
  it('returns the district/city of a long geocoded address (drops building + country)', () => {
    expect(
      shortLocation(
        'برج 2CW4+W65 Mansoura Qism 2, El Mansoura 2, Dakahlia Governorate 7661660, Egypt',
      ),
    ).toBe('El Mansoura 2');
  });

  it('falls back to the first segment when dropping the country leaves one part', () => {
    expect(shortLocation('Riyadh, Saudi Arabia')).toBe('Riyadh');
  });

  it('returns a single-part address unchanged, and undefined for empty/missing', () => {
    expect(shortLocation('Jeddah')).toBe('Jeddah');
    expect(shortLocation('')).toBeUndefined();
    expect(shortLocation(undefined)).toBeUndefined();
  });
});

describe('formatBudget', () => {
  it('formats the full figure with grouped Western digits (no K/M)', () => {
    expect(formatBudget(200000)).toBe('200,000');
    expect(formatBudget(800000)).toBe('800,000');
    expect(formatBudget(3000000)).toBe('3,000,000');
    expect(formatBudget(1500000)).toBe('1,500,000');
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
