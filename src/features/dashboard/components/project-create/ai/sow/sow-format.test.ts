import { describe, expect, it } from 'vitest';

import { compact, formatAmount, formatRange, hasText } from './sow-format';

describe('formatAmount', () => {
  it('groups with Western digits and rounds', () => {
    expect(formatAmount(80000)).toBe('80,000');
    expect(formatAmount(1234.6)).toBe('1,235');
  });
});

describe('formatRange', () => {
  it('renders a band, a single figure, or empty', () => {
    expect(formatRange({ min: 1000, max: 2000 })).toBe('1,000 – 2,000');
    expect(formatRange({ min: 1500, max: 1500 })).toBe('1,500');
    expect(formatRange({ min: 500 })).toBe('500');
    expect(formatRange({})).toBe('');
    expect(formatRange(undefined)).toBe('');
  });
});

describe('hasText / compact', () => {
  it('detects non-blank text', () => {
    expect(hasText(' x ')).toBe(true);
    expect(hasText('   ')).toBe(false);
    expect(hasText(undefined)).toBe(false);
  });
  it('drops empty entries', () => {
    expect(compact(['a', '', null, 'b', undefined])).toEqual(['a', 'b']);
    expect(compact(undefined)).toEqual([]);
  });
});
