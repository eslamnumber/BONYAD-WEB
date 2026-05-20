import { z } from 'zod';

import { saudiPhoneSchema } from '../utils';

export const forgotPasswordFormSchema = z.object({
  phone: saudiPhoneSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const forgotPasswordRequestSchema = z.object({
  phoneNumber: z.string(),
  role: z.enum(['USER', 'TECHNICIAN']),
});

export const forgotPasswordResponseSchema = z.object({
  message: z.string().optional(),
});

export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;
