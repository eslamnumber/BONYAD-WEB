import { z } from 'zod';

import { normalizePhoneForApi } from './phone';

/**
 * Saudi mobile: 9 digits starting with 5, accepted with or without a leading 0.
 * Normalises the input before checking length so the form accepts `0501234567`,
 * `501234567`, and `٠٥٠١٢٣٤٥٦٧` (Arabic digits) identically.
 */
export const saudiPhoneSchema = z
  .string()
  .min(1, { message: 'auth.errors.phoneRequired' })
  .refine(
    (raw) => {
      const normalized = normalizePhoneForApi(raw);
      return normalized.length === 9 && normalized.startsWith('5');
    },
    { message: 'auth.errors.phoneMust9DigitsStarting5' },
  );

/** Names cannot contain digits. Length must be ≥ 1. */
export const personNameSchema = z
  .string()
  .min(1, { message: 'auth.errors.nameRequired' })
  .refine((v) => !/\d/.test(v), { message: 'auth.errors.nameNoDigits' });
