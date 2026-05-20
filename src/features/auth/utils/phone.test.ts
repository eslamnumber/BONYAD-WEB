import { describe, expect, it } from 'vitest';

import { normalizePhoneForApi, normalizePhoneInput } from './phone';

describe('normalizePhoneInput', () => {
  it('strips non-digit characters', () => {
    expect(normalizePhoneInput('abc123def456')).toBe('123456');
  });

  it('converts Arabic digits to Western digits', () => {
    expect(normalizePhoneInput('٠٥٠١٢٣٤٥٦٧')).toBe('0501234567');
  });

  it('converts Persian digits to Western digits', () => {
    expect(normalizePhoneInput('۰۵۰۱۲۳۴۵۶۷')).toBe('0501234567');
  });

  it('caps at 10 characters so the leading 0 + 9-digit body fits', () => {
    expect(normalizePhoneInput('05012345678901234')).toBe('0501234567');
  });

  it('returns an empty string for non-numeric input', () => {
    expect(normalizePhoneInput('hello world')).toBe('');
  });
});

describe('normalizePhoneForApi', () => {
  it('strips the leading zero so a 9-digit Saudi mobile remains', () => {
    expect(normalizePhoneForApi('0501234567')).toBe('501234567');
  });

  it('passes through a 9-digit number that already lacks a leading zero', () => {
    expect(normalizePhoneForApi('501234567')).toBe('501234567');
  });

  it('handles Arabic-digit input', () => {
    expect(normalizePhoneForApi('٠٥٠١٢٣٤٥٦٧')).toBe('501234567');
  });

  it('returns an empty string when no digits remain', () => {
    expect(normalizePhoneForApi('')).toBe('');
  });
});
