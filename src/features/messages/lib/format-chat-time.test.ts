import { describe, expect, it } from 'vitest';

import { formatChatTime, formatMessageTime } from './format-chat-time';

const LABELS = { now: 'Now', yesterday: 'Yesterday' };

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

describe('formatChatTime', () => {
  it('returns the "now" label for a same-day timestamp', () => {
    expect(formatChatTime(daysAgo(0), 'en', LABELS)).toBe('Now');
  });

  it('returns the "yesterday" label for a one-day-old timestamp', () => {
    expect(formatChatTime(daysAgo(1), 'en', LABELS)).toBe('Yesterday');
  });

  it('returns a localized weekday within the last week', () => {
    const iso = daysAgo(3);
    const expected = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date(iso));
    expect(formatChatTime(iso, 'en', LABELS)).toBe(expected);
  });

  it('returns a localized short date beyond a week', () => {
    const iso = daysAgo(20);
    const expected = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(
      new Date(iso),
    );
    expect(formatChatTime(iso, 'en', LABELS)).toBe(expected);
  });

  it('uses the Arabic locale for date formatting', () => {
    const iso = daysAgo(3);
    const expected = new Intl.DateTimeFormat('ar', { weekday: 'long' }).format(new Date(iso));
    expect(formatChatTime(iso, 'ar', LABELS)).toBe(expected);
  });

  it('returns an empty string for missing or invalid input', () => {
    expect(formatChatTime(undefined, 'en', LABELS)).toBe('');
    expect(formatChatTime('not-a-date', 'en', LABELS)).toBe('');
  });
});

describe('formatMessageTime', () => {
  it('formats the clock time for the locale', () => {
    const iso = '2026-06-07T10:05:00';
    const expected = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(
      new Date(iso),
    );
    expect(formatMessageTime(iso, 'en')).toBe(expected);
  });

  it('returns an empty string for missing or invalid input', () => {
    expect(formatMessageTime(undefined, 'en')).toBe('');
    expect(formatMessageTime('nonsense', 'ar')).toBe('');
  });
});
