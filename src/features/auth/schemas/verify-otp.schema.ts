import { z } from 'zod';

export const verifyOtpFormSchema = z.object({
  otp: z
    .string()
    .min(1, { message: 'auth.errors.otpRequired' })
    .regex(/^\d{4}$/, { message: 'auth.errors.otpInvalid' }),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>;

export const verifyOtpRequestSchema = z.object({
  phoneNumber: z.string(),
  otpCode: z.string(),
  role: z.enum(['USER', 'TECHNICIAN']),
});

export const resendOtpRequestSchema = z.object({
  phoneNumber: z.string(),
  role: z.enum(['USER', 'TECHNICIAN']),
});

export const verifyOtpResponseSchema = z.object({
  token: z.string().optional(),
  message: z.string().optional(),
});

export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
