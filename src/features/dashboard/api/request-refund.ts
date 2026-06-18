import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { requestRefundRequestSchema, type RefundRequest } from '../schemas/transaction';

export type RequestRefundVars = { transactionId: number; reason: string };

/**
 * Submit a refund request for a transaction. Mirrors the iOS call site
 * bonayd-ios/bonyad-cr-2/App/Utils/PaymentTransactionService.swift:225 — POST
 * /payments/transactions/:id/refund-request with a `{ reason }` body (reason ≥ 10
 * chars, zod-validated per rule 1). Returns the created {@link RefundRequest}.
 */
export async function requestRefund({
  transactionId,
  reason,
}: RequestRefundVars): Promise<RefundRequest> {
  const body = requestRefundRequestSchema.parse({ reason });
  const path = API_ENDPOINTS.PAYMENT.REQUEST_REFUND.replace(':id', String(transactionId));
  return apiClient.post<RefundRequest>(path, { body });
}

/**
 * After a successful request the source transaction flips `hasRefundRequest` and a
 * new row appears under Refund Requests — refresh both list namespaces.
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation<RefundRequest, Error, RequestRefundVars>({
    mutationFn: requestRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'refund-requests'] });
    },
  });
}
