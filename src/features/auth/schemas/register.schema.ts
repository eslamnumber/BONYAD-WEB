import { z } from 'zod';

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'auth.errors.nameRequired' })
      .min(2, { message: 'auth.errors.nameTooShort' }),
    phone: z
      .string()
      .min(1, { message: 'auth.errors.phoneRequired' })
      .regex(/^\d{9,15}$/, { message: 'auth.errors.phoneInvalid' }),
    password: z
      .string()
      .min(1, { message: 'auth.errors.passwordRequired' })
      .min(6, { message: 'auth.errors.passwordTooShort' }),
    confirmPassword: z.string().min(1, { message: 'auth.errors.confirmPasswordRequired' }),
    terms: z.boolean().refine((v) => v === true, { message: 'auth.errors.termsRequired' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const registerRequestSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  password: z.string(),
  role: z.enum(['USER', 'TECHNICIAN']),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  token: z.string(),
  user: z
    .object({
      id: z.number(),
      role: z.enum(['USER', 'TECHNICIAN']).optional(),
    })
    .optional(),
  userId: z.number().optional(),
  role: z.enum(['USER', 'TECHNICIAN']).optional(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
