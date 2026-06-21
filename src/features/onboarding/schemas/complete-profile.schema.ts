import { z } from 'zod';

/**
 * "Complete your profile" form values — the strict request contract for technician
 * onboarding step 2 (rule 1). Validation messages are i18n keys, translated at the
 * form layer (forms-validation rule 4). The form's `bio` maps to the API's
 * `description` field, and `yearsOfExperience` is kept as the picker's string value
 * (the backend stores it as a numeric string — mirrors the iOS submit body).
 */
export const completeProfileSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'onboarding.completeProfile.errors.emailRequired' })
    .email({ message: 'onboarding.completeProfile.errors.emailInvalid' }),
  bio: z
    .string()
    .trim()
    .min(10, { message: 'onboarding.completeProfile.errors.bioTooShort' })
    .max(1000, { message: 'onboarding.completeProfile.errors.bioTooLong' }),
  address: z
    .string()
    .trim()
    .min(1, { message: 'onboarding.completeProfile.errors.addressRequired' })
    .max(200, { message: 'onboarding.completeProfile.errors.addressTooLong' }),
  yearsOfExperience: z
    .string()
    .min(1, { message: 'onboarding.completeProfile.errors.experienceRequired' }),
  regionIds: z
    .array(z.number().int())
    .min(1, { message: 'onboarding.completeProfile.errors.regionsRequired' }),
});

export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;
