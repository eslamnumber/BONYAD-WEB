import { z } from 'zod';

import { strongPasswordSchema } from '../utils';

/**
 * Reset-password form (forgot-password flow, final step). The OTP and the new
 * password are entered together and sent in one call — the backend verifies the
 * code as part of the reset (mirrors the RN `ForgotPasswordOTPScreen`, which
 * calls `resetPassword` directly with no separate verify step). Messages are
 * i18n keys (forms-validation rule 4).
 */
export const resetPasswordFormSchema = z
  .object({
    otp: z
      .string()
      .min(1, { message: 'auth.errors.otpRequired' })
      .regex(/^\d{4}$/, { message: 'auth.errors.otpInvalid' }),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, { message: 'auth.errors.confirmPasswordRequired' }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'auth.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

/** POST /auth/reset-password body — mirrors AuthService.resetPassword (RN). */
export const resetPasswordRequestSchema = z.object({
  phoneNumber: z.string(),
  role: z.enum(['USER', 'TECHNICIAN']),
  otpCode: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

/** Permissive response type (rule 1: no strict zod on backend-controlled bodies). */
export type ResetPasswordResponse = { message?: string };
