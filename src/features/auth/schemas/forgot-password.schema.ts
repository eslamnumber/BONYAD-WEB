import { z } from 'zod';

export const forgotPasswordFormSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'auth.errors.phoneRequired' })
    .regex(/^\d{9,15}$/, { message: 'auth.errors.phoneInvalid' }),
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
