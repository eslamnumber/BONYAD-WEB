import { useInfiniteQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { toPage } from '../lib/transaction-response';
import { type RefundRequest, type RefundRequestsPage } from '../schemas/transaction';

export const myRefundRequestsQueryKey = () => ['payments', 'refund-requests'] as const;

/**
 * The signed-in user's refund requests (paged). Mirrors the RN call site
 * website-bonyad/src/services/PaymentService.ts:136 and the iOS service
 * bonayd-ios/bonyad-cr-2/App/Utils/PaymentTransactionService.swift:257 — GET
 * /payments/my-refund-requests?page&size. Permissive response (rule 1): a Spring
 * page or a bare array both normalise to a {@link RefundRequestsPage}.
 */
export async function getMyRefundRequests(page = 0, size = 20): Promise<RefundRequestsPage> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PAYMENT.MY_REFUND_REQUESTS, {
    params: { page, size },
  });
  return toPage<RefundRequest>(data, page);
}

export function useMyRefundRequests() {
  return useInfiniteQuery({
    queryKey: myRefundRequestsQueryKey(),
    queryFn: ({ pageParam }) => getMyRefundRequests(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.isLast ? undefined : lastPage.number + 1),
    staleTime: 1000 * 30,
  });
}
