import { z } from 'zod';

import { strongPasswordSchema } from '../utils';

/**
 * Change-password form. The new password is held to the full account policy
 * ({@link strongPasswordSchema} + the live rules list), and must match the
 * confirmation. The old password is only required non-empty — the backend
 * verifies it. Messages are i18n keys (forms-validation rule 4).
 */
export const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'auth.errors.passwordRequired' }),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, { message: 'auth.errors.confirmPasswordRequired' }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'auth.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

/** PUT /users/:userId/change-password body (mirrors iOS MyProfile.swift:1496). */
export const changePasswordRequestSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
