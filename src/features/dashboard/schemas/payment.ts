import { z } from 'zod';

/** Customer identity block HyperPay requires (strict; the backend rejects blanks). */
const checkoutCustomerSchema = z.object({
  email: z.string().email(),
  givenName: z.string().min(1),
  surname: z.string().min(1),
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
 * Request body for POST /payments/create-checkout. Strict (CLAUDE rule 1). Mirrors the
 * backend CreateCheckoutRequest (bonyad/.../dto/CreateCheckoutRequest.java): amount,
 * currency, paymentType ('DB'), merchantTransactionId, customer, billing, optional
 * phaseId + shopperResultUrl. The FULL/PARTIAL split rides in merchantTransactionId +
 * the widget's form `action`, not here.
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
 * Response from POST /payments/create-checkout — the real backend DTO
 * (bonyad/.../dto/CreateCheckoutResponse.java). Permissive (CLAUDE rule 1). Returns
 * `checkoutId` for the embedded COPYandPAY widget (`paymentWidgets.js?checkoutId=`) —
 * there is **no** hosted redirect URL. `mode` (TEST/LIVE) selects the widget host
 * (present once the backend serializes it; else the client falls back to
 * env.NEXT_PUBLIC_HYPERPAY_MODE). A failure arrives as HTTP 400 (→ ApiError) or
 * `success: false`; the `code` on a created checkout is `000.200.100`, not an error.
 */
export type CreateCheckoutResponseBody = {
  success?: boolean;
  checkoutId?: string;
  /** 'TEST' | 'LIVE' — backend admin toggle; selects the OPP widget host. */
  mode?: string;
  integrity?: string;
  expiresAt?: string;
  resourcePath?: string;
  code?: string;
  description?: string;
  message?: string;
  error?: string;
};

/** Normalised checkout the UI consumes: the id for the widget + the host mode. */
export type CheckoutSession = {
  checkoutId: string;
  /** 'TEST' | 'LIVE', or null when the backend didn't send it (env fallback then). */
  mode: string | null;
  expiresAt: string | null;
};

/**
 * Response from POST /phases/:phaseId/request-payment (technician). Permissive
 * (CLAUDE rule 1) — `paymentStatus` is backend-controlled, never z.enum'd. Mirrors the
 * backend RequestPaymentResponse (PhaseService).
 */
export type RequestPaymentResponse = {
  message?: string;
  phaseId?: number;
  phaseNumber?: number;
  paymentStatus?: string;
  moneySpent?: number;
  requestedBy?: number;
  requestedByName?: string;
  requestedAt?: string;
  projectId?: number;
};

/**
 * Response from GET /payments/status/:checkoutId — the real backend (flat)
 * PaymentStatusResponse (bonyad/.../dto/PaymentStatusResponse.java). Permissive. The
 * backend pre-classifies the verdict in `paymentResult`; the raw HyperPay `code` is
 * also surfaced. `amount` is a BigDecimal (number over the wire).
 */
export type PaymentStatusBody = {
  success?: boolean;
  paymentResult?: boolean;
  transactionId?: string;
  amount?: string | number;
  currency?: string;
  paymentBrand?: string;
  status?: string;
  code?: string;
  description?: string;
  message?: string;
  error?: string;
};

/** Normalised payment status the /payment/callback page + inline result modal consume. */
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
