import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves conflicting Tailwind utilities by keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('ignores falsy values', () => {
    const falsy: false | string = false;
    expect(cn('foo', falsy && 'bar', null, undefined, 'baz')).toBe('foo baz');
  });

  it('handles arrays and objects', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('returns an empty string when given nothing', () => {
    expect(cn()).toBe('');
  });
});
