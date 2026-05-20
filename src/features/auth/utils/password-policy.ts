import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /\d/;
const SPECIAL_REGEX = /[^A-Za-z0-9]/;
const WHITESPACE_REGEX = /\s/;

/**
 * Returns true if the value contains a run of ascending consecutive digits longer than 3
 * (e.g. `1234`, `5678`). Does not flag repeated digits (`1111`) or non-ascending pairs (`1313`).
 * Ported verbatim from `website-bonyad/src/validation/passwordPolicy.ts` so the policy matches the RN app.
 */
export function hasLongDigitSequence(value: string): boolean {
  let run = 1;
  let lastDigit: number | null = null;
  for (const char of value) {
    const digit = Number.isNaN(Number(char)) ? null : Number(char);
    if (digit === null) {
      run = 1;
      lastDigit = null;
      continue;
    }
    if (lastDigit !== null && digit === lastDigit + 1) {
      run += 1;
      if (run > 3) return true;
    } else {
      run = 1;
    }
    lastDigit = digit;
  }
  return false;
}

export type PasswordRuleKey =
  | 'minLength'
  | 'uppercase'
  | 'digit'
  | 'special'
  | 'noSpaces'
  | 'noSequence';

export type PasswordRuleFlags = Record<PasswordRuleKey, boolean>;

export function evaluatePassword(password: string): { rules: PasswordRuleFlags; isValid: boolean } {
  const rules: PasswordRuleFlags = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: UPPERCASE_REGEX.test(password),
    digit: NUMBER_REGEX.test(password),
    special: SPECIAL_REGEX.test(password),
    noSpaces: password.length > 0 && !WHITESPACE_REGEX.test(password),
    noSequence: !hasLongDigitSequence(password),
  };
  const isValid = Object.values(rules).every(Boolean);
  return { rules, isValid };
}

/**
 * Ordered list of policy rules. UI iterates this to render the live checklist;
 * keeping it next to `evaluatePassword` means the UI and the validator can never drift.
 */
export const PASSWORD_RULE_ORDER: readonly { key: PasswordRuleKey; i18nKey: string }[] = [
  { key: 'minLength', i18nKey: 'auth.passwordRules.minLength' },
  { key: 'uppercase', i18nKey: 'auth.passwordRules.uppercase' },
  { key: 'digit', i18nKey: 'auth.passwordRules.digit' },
  { key: 'special', i18nKey: 'auth.passwordRules.special' },
  { key: 'noSpaces', i18nKey: 'auth.passwordRules.noSpaces' },
  { key: 'noSequence', i18nKey: 'auth.passwordRules.noSequence' },
];

export const strongPasswordSchema = z
  .string()
  .min(1, { message: 'auth.errors.passwordRequired' })
  .superRefine((value, ctx) => {
    const { rules } = evaluatePassword(value);
    const failed = PASSWORD_RULE_ORDER.find(({ key }) => !rules[key]);
    if (failed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `auth.errors.password_${failed.key}`,
      });
    }
  });
