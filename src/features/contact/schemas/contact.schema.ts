import { z } from 'zod';

import { saudiPhoneSchema } from '@/lib/saudi-phone';

const EMAIL_MAX = 254;
const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;

export const contactFormSchema = z.object({
  phone: saudiPhoneSchema,
  email: z
    .string()
    .min(1, { message: 'contact.errors.emailRequired' })
    .max(EMAIL_MAX, { message: 'contact.errors.emailTooLong' })
    .email({ message: 'contact.errors.emailInvalid' }),
  title: z
    .string()
    .min(TITLE_MIN, { message: 'contact.errors.titleTooShort' })
    .max(TITLE_MAX, { message: 'contact.errors.titleTooLong' }),
  description: z
    .string()
    .min(DESCRIPTION_MIN, { message: 'contact.errors.descriptionTooShort' })
    .max(DESCRIPTION_MAX, { message: 'contact.errors.descriptionTooLong' }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactRequestSchema = z.object({
  email: z.string(),
  phoneNumber: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;

/**
 * Permissive — the backend may add fields (rule 1). Only `ticketNumber` is
 * load-bearing for the success view; everything else is optional passthrough.
 */
export type ContactResponse = {
  success?: boolean;
  ticketNumber?: string;
  email?: string;
  message?: string;
  createdAt?: string;
};
