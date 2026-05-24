import { z } from 'zod';

export { saudiPhoneSchema } from '@/lib/saudi-phone';

/** Names cannot contain digits. Length must be ≥ 1. */
export const personNameSchema = z
  .string()
  .min(1, { message: 'auth.errors.nameRequired' })
  .refine((v) => !/\d/.test(v), { message: 'auth.errors.nameNoDigits' });
