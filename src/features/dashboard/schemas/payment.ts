import { z } from 'zod';

/** Customer identity block HyperPay requires (strict). */
const checkoutCustomerSchema = z.object({
  email: z.string().email(),
  givenName: z.string().min(1),
  surname: z.string(),
});

/** Billing address block HyperPay requires (strict). `country` is the ISO-2 code. */
const checkoutBillingSchema = z.object({
  street1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postcode: z.string().min(1),
});

/**
 * Request body for POST /payments/create-checkout (phase payment). Strict (CLAUDE
 * rule 1). Mirrors the RN call site
 * website-bonyad/src/services/HyperPayService.ts:120 (PrepareCheckoutRequest) +
 * website-bonyad/src/screens/projects/in-progress/hooks/usePayment.ts:36.
 * `paymentType` here is the HyperPay transaction type ('DB' = debit), NOT the
 * FULL/PARTIAL split — that travels in `merchantTransactionId` + `shopperResultUrl`
 * and is settled on the later POST /phases/:id/pay call.
 */
export const createCheckoutRequestSchema = z.object({
  phaseId: z.number().int().positive(),
  amount: z.number().positive(),
  currency: z.string().min(1).default('SAR'),
  paymentType: z.string().min(1).default('DB'),
  paymentBrand: z.enum(['MADA', 'VISA', 'MASTER', 'APPLEPAY']).default('MADA'),
  merchantTransactionId: z.string().min(1),
  customer: checkoutCustomerSchema,
  billing: checkoutBillingSchema,
  shopperResultUrl: z.string().url(),
});

export type CreateCheckoutRequest = z.infer<typeof createCheckoutRequestSchema>;

/**
 * Response from POST /payments/create-checkout. Permissive TS type (CLAUDE rule 1:
 * never strict-parse a backend response). The backend returns one of several
 * shapes; the fetcher normalises `checkoutId` (`checkoutId ?? id ?? ndc`) and
 * `redirectUrl` (`redirectUrl ?? shopperUrl`). A `result.code` not starting with
 * '000.' is a HyperPay error forwarded over HTTP 200.
 */
export type CreateCheckoutResponseBody = {
  success?: boolean;
  checkoutId?: string;
  id?: string;
  ndc?: string;
  shopperUrl?: string;
  redirectUrl?: string;
  environment?: string;
  transactionId?: number | string;
  result?: { code?: string; description?: string };
  error?: string;
  message?: string;
};

/** Normalised checkout result the UI consumes (the raw body collapsed to essentials). */
export type CheckoutSession = {
  checkoutId: string;
  /** HyperPay hosted-page URL to redirect to (null in mimic mode). */
  redirectUrl: string | null;
  environment: string | null;
  /** True when the backend simulated the charge (no real gateway) — skip the redirect. */
  isMimic: boolean;
};

/**
 * Request body for POST /phases/:phaseId/pay. Strict. Every field optional — RN
 * sends an empty body for a plain pay, or this block for gateway-backed payments.
 * Mirrors website-bonyad/src/services/PhaseService.ts:138 (payPhase params).
 */
export const payPhaseRequestSchema = z.object({
  paymentType: z.enum(['FULL', 'PARTIAL']).optional(),
  amount: z.number().positive().optional(),
  paymentMethod: z.string().min(1).optional(),
  paymentReference: z.string().min(1).optional(),
  gatewayTransactionId: z.string().min(1).optional(),
});

export type PayPhaseRequest = z.infer<typeof payPhaseRequestSchema>;

/**
 * Response from POST /phases/:phaseId/pay. Permissive. Mirrors
 * website-bonyad/src/services/PhaseService.ts:55 (PayPhaseResponse).
 */
export type PayPhaseResponse = {
  message?: string;
  phaseId?: number;
  phaseNumber?: number;
  paymentStatus?: string;
  moneySpent?: number;
  amountPaid?: number;
  remainingAmount?: number;
  paidAt?: string;
  projectId?: number;
};

/**
 * Response from GET /payments/status/:checkoutId. Permissive. The backend surfaces
 * the HyperPay result at the top level (and may also wrap it under `result`).
 * Mirrors website-bonyad/src/services/HyperPayService.ts:78 (PaymentStatusResponse).
 */
export type PaymentStatusBody = {
  success?: boolean;
  paymentResult?: boolean;
  code?: string;
  description?: string;
  amount?: string | number;
  currency?: string;
  paymentBrand?: string;
  transactionId?: string;
  ndc?: string;
  status?: string;
  isPending?: boolean;
  error?: string;
  message?: string;
  result?: {
    code?: string;
    description?: string;
    paymentBrand?: string;
    amount?: string | number;
    currency?: string;
  };
};

/** Normalised payment status the /payment/callback page consumes. */
export type PaymentResult = {
  success: boolean;
  isPending: boolean;
  code?: string;
  description?: string;
  transactionId?: string;
  amount?: string | number;
  currency?: string;
  paymentBrand?: string;
};
