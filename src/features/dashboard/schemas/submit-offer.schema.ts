import { z } from 'zod';

import { type CreateBidRequest, type ProjectBid } from './bid';

/** Weeks → backend `estimatedDurationDays`. */
const DAYS_PER_WEEK = 7;

/**
 * Submit-offer form schema (Figma node 1046:6967). Values are strings (the raw
 * input contents); {@link toCreateBidRequest} converts them to the numeric
 * {@link CreateBidRequest} the API expects. Messages are i18n keys, translated
 * at render. The duration is captured in weeks and converted to days for
 * `estimatedDurationDays` (the only unit the backend stores).
 */
export const submitOfferFormSchema = z.object({
  proposedBudget: z
    .string()
    .trim()
    .refine((v) => Number(v) > 0, { message: 'dashboard.jobOffer.form.errors.priceInvalid' }),
  durationWeeks: z
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
    estimatedDurationDays: Math.round(Number(values.durationWeeks) * DAYS_PER_WEEK),
    comment: values.comment.trim(),
  };
}

/** Backend days → whole weeks (the unit the form captures), min 1. */
export function daysToWeeks(days: number): number {
  return Math.max(1, Math.round(days / DAYS_PER_WEEK));
}

/**
 * The SP's just-submitted offer, lifted out of the form so the panel can swap to
 * the bid-status card (Figma "Dashboard-SP (Project detail) - Offer sent", node
 * 1103:6247). Carries the raw form `values` (to pre-fill the form when the SP
 * taps "Edit offer"), the numeric `request` (for the displayed value/duration),
 * and the permissive bits the create response returns.
 */
export type SubmittedOffer = {
  /** Bid id — present once the bid exists (create response or fetched bid); needed to withdraw/edit. */
  id?: number;
  values: SubmitOfferFormValues;
  request: CreateBidRequest;
  status?: string;
  createdAt?: string;
};

/**
 * Build a {@link SubmittedOffer} from a bid fetched via GET /bids/project/:id, so
 * the bid-status card renders on load for an SP who already bid. `values`
 * back-fills the form for the "Edit offer" path (days → whole weeks, the unit
 * the form captures); `request` drives the displayed value/duration.
 */
export function bidToSubmittedOffer(bid: ProjectBid): SubmittedOffer {
  const proposedBudget = bid.proposedBudget ?? 0;
  const days = bid.estimatedDurationDays ?? 0;
  return {
    id: bid.id,
    values: {
      proposedBudget: proposedBudget ? String(proposedBudget) : '',
      durationWeeks: days ? String(daysToWeeks(days)) : '',
      comment: bid.comment ?? '',
    },
    request: {
      projectId: bid.projectId ?? 0,
      proposedBudget,
      estimatedDurationDays: days,
      comment: bid.comment ?? '',
    },
    status: bid.status,
    createdAt: bid.createdAt,
  };
}
