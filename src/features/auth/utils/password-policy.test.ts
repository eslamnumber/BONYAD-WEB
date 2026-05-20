import { describe, expect, it } from 'vitest';

import { evaluatePassword, hasLongDigitSequence } from './password-policy';

describe('hasLongDigitSequence', () => {
  it('flags an ascending run longer than 3', () => {
    expect(hasLongDigitSequence('abc1234')).toBe(true);
    expect(hasLongDigitSequence('5678!')).toBe(true);
  });

  it('does not flag short ascending runs', () => {
    expect(hasLongDigitSequence('abc123')).toBe(false);
  });

  it('does not flag repeated digits', () => {
    expect(hasLongDigitSequence('Aa1111!')).toBe(false);
  });

  it('does not flag non-ascending pairs', () => {
    expect(hasLongDigitSequence('Aa1313!')).toBe(false);
  });

  it('returns false for digit-free input', () => {
    expect(hasLongDigitSequence('AbcDef!')).toBe(false);
  });
});

describe('evaluatePassword', () => {
  it('accepts a fully compliant password', () => {
    const { rules, isValid } = evaluatePassword('MyPass1!');
    expect(isValid).toBe(true);
    expect(rules).toEqual({
      minLength: true,
      uppercase: true,
      digit: true,
      special: true,
      noSpaces: true,
      noSequence: true,
    });
  });

  it('rejects short passwords', () => {
    const { isValid, rules } = evaluatePassword('A1!');
    expect(isValid).toBe(false);
    expect(rules.minLength).toBe(false);
  });

  it('rejects passwords with no uppercase', () => {
    const { rules } = evaluatePassword('mypass1!');
    expect(rules.uppercase).toBe(false);
  });

  it('rejects passwords with no digit', () => {
    const { rules } = evaluatePassword('MyPassword!');
    expect(rules.digit).toBe(false);
  });

  it('rejects passwords with no special character', () => {
    const { rules } = evaluatePassword('MyPassw1ord');
    expect(rules.special).toBe(false);
  });

  it('rejects passwords containing a space', () => {
    const { rules } = evaluatePassword('My Pass1!');
    expect(rules.noSpaces).toBe(false);
  });

  it('rejects passwords with a 1234-style sequence', () => {
    const { rules } = evaluatePassword('MyPass1234!');
    expect(rules.noSequence).toBe(false);
  });

  it('flags every rule on an empty input', () => {
    const { rules, isValid } = evaluatePassword('');
    expect(isValid).toBe(false);
    expect(rules.minLength).toBe(false);
    expect(rules.noSpaces).toBe(false);
  });
});
