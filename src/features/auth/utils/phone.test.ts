import { describe, expect, it } from 'vitest';

import { normalizePhoneForApi, normalizePhoneInput } from './phone';

describe('normalizePhoneInput', () => {
  it('keeps a Saudi national number that already starts with 5', () => {
    expect(normalizePhoneInput('501234567')).toBe('501234567');
  });

  it('strips a leading 0 from the local format', () => {
    expect(normalizePhoneInput('0501234567')).toBe('501234567');
  });

  it('strips a +966 / 966 country code', () => {
    expect(normalizePhoneInput('+966501234567')).toBe('501234567');
    expect(normalizePhoneInput('966501234567')).toBe('501234567');
  });

  it('strips a 00966 international prefix', () => {
    expect(normalizePhoneInput('00966501234567')).toBe('501234567');
  });

  it('converts Arabic digits to Western and normalizes', () => {
    expect(normalizePhoneInput('٠٥٠١٢٣٤٥٦٧')).toBe('501234567');
  });

  it('converts Persian digits to Western and normalizes', () => {
    expect(normalizePhoneInput('۰۵۰۱۲۳۴۵۶۷')).toBe('501234567');
  });

  it('rejects a number whose body does not start with 5', () => {
    expect(normalizePhoneInput('0111234567')).toBe('');
    expect(normalizePhoneInput('123456')).toBe('');
    expect(normalizePhoneInput('9')).toBe('');
  });

  it('hard-caps the body at 9 digits', () => {
    expect(normalizePhoneInput('05012345678901234')).toBe('501234567');
  });

  it('returns an empty string for non-numeric input', () => {
    expect(normalizePhoneInput('hello world')).toBe('');
  });
});

describe('normalizePhoneForApi', () => {
  it('returns the 9-digit national body from the local format', () => {
    expect(normalizePhoneForApi('0501234567')).toBe('501234567');
  });

  it('passes through a 9-digit number that already lacks a leading zero', () => {
    expect(normalizePhoneForApi('501234567')).toBe('501234567');
  });

  it('handles Arabic-digit input', () => {
    expect(normalizePhoneForApi('٠٥٠١٢٣٤٥٦٧')).toBe('501234567');
  });

  it('returns an empty string when the number is not a Saudi mobile', () => {
    expect(normalizePhoneForApi('0111234567')).toBe('');
    expect(normalizePhoneForApi('')).toBe('');
  });
});
