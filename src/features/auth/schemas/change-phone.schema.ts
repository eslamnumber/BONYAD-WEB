import { z } from 'zod';

import { saudiPhoneSchema } from '@/lib/saudi-phone';

/** Phone step — a Saudi mobile (validated + normalised to `5XXXXXXXX`). */
export const changePhoneFormSchema = z.object({ phone: saudiPhoneSchema });
export type ChangePhoneFormValues = z.infer<typeof changePhoneFormSchema>;

/** POST /users/:userId/change-phone-request body (iOS MyProfile.swift:1109). */
export const changePhoneRequestSchema = z.object({ newPhoneNumber: z.string().regex(/^5\d{8}$/) });

/** Body for the internal verify route — `{ userId, otpCode }` (4-digit OTP). */
export const verifyPhoneRequestSchema = z.object({
  userId: z.number().int().positive(),
  otpCode: z.string().regex(/^\d{4}$/),
});

/** Internal route response — the updated user (for the auth store). */
export type VerifyPhoneResult = { user?: { phoneNumber?: string; name?: string } | null };
