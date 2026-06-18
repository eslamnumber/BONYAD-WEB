import { z } from 'zod';

/**
 * A saved payment card. Permissive TS type (CLAUDE rule 1 — never strict-parse a
 * backend response). Mirrors the iOS `PaymentCard`
 * (bonayd-ios/.../Utils/TechnicianCardService.swift): the gateway owns the brand
 * string and the validation flags, so none of it is zod-enumerated here.
 */
export type PaymentCard = {
  id: number;
  /** Gateway brand label, e.g. `VISA` · `MASTERCARD` · `MADA` · `AMEX`. */
  paymentBrand: string;
  cardBin?: string;
  lastFourDigits: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  /** The card charged for payouts/payments unless another is picked. */
  isDefault: boolean;
  /** `false` until the 1 SAR preauth clears — surfaced as a "pending" pill. */
  isValidated: boolean;
  createdAt?: string;
};

/** GET /user/cards. Permissive — the fetcher tolerates a bare array or `{ cards }`. */
export type CardListResponseBody = {
  success?: boolean;
  cards?: PaymentCard[];
  error?: string;
  message?: string;
};

/**
 * POST /user/cards/prepare → opens a 1 SAR HyperPay preauth checkout. Permissive:
 * the iOS client reads only `checkoutId`, but the web hosted-redirect flow also
 * normalises `redirectUrl ?? shopperUrl` (some deployments return a hosted-page URL,
 * mimic mode returns none). A `success: false` is a forwarded failure over HTTP 200.
 */
export type PrepareCardResponseBody = {
  success?: boolean;
  checkoutId?: string;
  id?: string;
  redirectUrl?: string;
  shopperUrl?: string;
  environment?: string;
  error?: string;
  message?: string;
};

/** Normalised prepare result the UI consumes (raw body collapsed to essentials). */
export type CardCheckoutSession = {
  checkoutId: string;
  /** HyperPay hosted-page URL to redirect to (null when the backend returns none). */
  redirectUrl: string | null;
  environment: string | null;
  /** True when the charge is backend-simulated (`MIMIC_…`) — skip the redirect. */
  isMimic: boolean;
};

/** Request body for POST /user/cards/complete. Strict (CLAUDE rule 1). */
export const completeCardRequestSchema = z.object({
  checkoutId: z.string().min(1),
});

export type CompleteCardRequest = z.infer<typeof completeCardRequestSchema>;

/**
 * POST /user/cards/complete and the PUT/DELETE mutations. Permissive — every one
 * returns `{ success, card?, error?, message? }` in the iOS contract.
 */
export type CardMutationResponseBody = {
  success?: boolean;
  card?: PaymentCard;
  error?: string;
  message?: string;
};
