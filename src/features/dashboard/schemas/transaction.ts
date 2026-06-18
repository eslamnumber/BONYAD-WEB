import { z } from 'zod';

/**
 * A payment transaction. Permissive TS type (CLAUDE rule 1 — never strict-parse a
 * backend response; `status` / `paymentType` are backend-controlled strings, left
 * open so a new value never surfaces as "Something went wrong"). Mirrors the RN
 * call site website-bonyad/src/services/PaymentService.ts:10 and the iOS model
 * bonayd-ios/bonyad-cr-2/App/Utils/PaymentTransactionService.swift:4.
 */
export type PaymentTransaction = {
  id: number;
  amount: number;
  commissionAmount?: number;
  netAmount?: number;
  currency?: string;
  /** 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' (open). */
  status: string;
  paymentBrand?: string | null;
  /** 'PROJECT' | 'PHASE' | 'SMALL_TASK' (open). */
  paymentType?: string;
  projectId?: number;
  projectDescription?: string | null;
  phaseId?: number;
  phaseNumber?: number | null;
  smallTaskRequestId?: number;
  smallTaskTypeName?: string | null;
  transactionId?: string;
  checkoutId?: string;
  createdAt?: string;
  completedAt?: string | null;
  canRequestRefund?: boolean;
  hasRefundRequest?: boolean;
  refundRequestId?: number;
};

/**
 * A refund request the user submitted against a transaction. Permissive (rule 1).
 * Mirrors bonayd-ios/bonyad-cr-2/App/Utils/PaymentTransactionService.swift:71.
 */
export type RefundRequest = {
  id: number;
  transactionId?: number;
  amount?: number;
  currency?: string;
  reason: string;
  /** 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' (open). */
  status: string;
  adminNotes?: string | null;
  processedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
};

/** Spring Data Page envelope the list endpoints return (may degrade to a bare array). */
export type PageEnvelope<T> = {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  last?: boolean;
};

/** One normalised page the infinite-query hooks accumulate. */
export type Page<T> = {
  items: T[];
  /** 0-indexed page number. */
  number: number;
  isLast: boolean;
  totalElements?: number;
};

export type TransactionsPage = Page<PaymentTransaction>;
export type RefundRequestsPage = Page<RefundRequest>;

/**
 * Status-filter keys for the Transactions tab. `all` sends no `status` param;
 * the rest are the backend status values (matches the iOS filter row).
 */
export const TRANSACTION_STATUS_FILTERS = [
  'all',
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
] as const;
export type TransactionStatusFilter = (typeof TRANSACTION_STATUS_FILTERS)[number];

/**
 * Request body for POST /payments/transactions/:id/refund-request. Strict (rule 1).
 * Reason ≥ 10 chars mirrors the iOS submit gate (TransactionsView submit disabled
 * under 10 characters).
 */
export const requestRefundRequestSchema = z.object({
  reason: z.string().trim().min(10),
});
export type RequestRefundInput = z.infer<typeof requestRefundRequestSchema>;
