import { z } from 'zod';

import { type CreateBidRequest } from './bid';

/**
 * Submit-offer form schema (Figma node 1046:6967). Values are strings (the raw
 * input contents); {@link toCreateBidRequest} converts them to the numeric
 * {@link CreateBidRequest} the API expects. Messages are i18n keys, translated
 * at render. The duration is captured in months (per the Figma placeholder
 * "e.g. 12 months") and converted to days for `estimatedDurationDays`.
 */
export const submitOfferFormSchema = z.object({
  proposedBudget: z
    .string()
    .trim()
    .refine((v) => Number(v) > 0, { message: 'dashboard.jobOffer.form.errors.priceInvalid' }),
  durationMonths: z
    .string()
    .trim()
    .refine((v) => Number(v) > 0, { message: 'dashboard.jobOffer.form.errors.durationInvalid' }),
  comment: z.string().trim().min(1, { message: 'dashboard.jobOffer.form.errors.messageRequired' }),
});

export type SubmitOfferFormValues = z.infer<typeof submitOfferFormSchema>;

export function toCreateBidRequest(
  values: SubmitOfferFormValues,
  projectId: number,
): CreateBidRequest {
  return {
    projectId,
    proposedBudget: Number(values.proposedBudget),
    estimatedDurationDays: Math.round(Number(values.durationMonths) * 30),
    comment: values.comment.trim(),
  };
}
