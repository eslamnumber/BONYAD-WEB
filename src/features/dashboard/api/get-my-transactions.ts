import { useInfiniteQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { toPage } from '../lib/transaction-response';
import { type PaymentTransaction, type TransactionsPage } from '../schemas/transaction';

export type TransactionQuery = { status?: string; type?: string; page?: number; size?: number };

/** Keyed by the status filter so changing it starts a fresh page-0 query. */
export const myTransactionsQueryKey = (status?: string) =>
  ['payments', 'transactions', status ?? 'all'] as const;

/**
 * The signed-in user's payment transactions (paged). Mirrors the RN call site
 * website-bonyad/src/services/PaymentService.ts:78 and the iOS service
 * bonayd-ios/bonyad-cr-2/App/Utils/PaymentTransactionService.swift:144 — GET
 * /payments/my-transactions?status&type&page&size. Permissive response: a Spring
 * page or a bare array both normalise to a {@link TransactionsPage}. Browser calls
 * go through `/api/proxy/*`, which attaches the session token.
 */
export async function getMyTransactions(query: TransactionQuery = {}): Promise<TransactionsPage> {
  const { status, type, page = 0, size = 20 } = query;
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PAYMENT.MY_TRANSACTIONS, {
    params: { status, type, page, size },
  });
  return toPage<PaymentTransaction>(data, page);
}

/**
 * Infinite list of the user's transactions, optionally filtered by status. Matches
 * the iOS reset-on-filter behaviour (a new `status` is a new query key → page 0).
 */
export function useMyTransactions(status?: string) {
  return useInfiniteQuery({
    queryKey: myTransactionsQueryKey(status),
    queryFn: ({ pageParam }) => getMyTransactions({ status, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.isLast ? undefined : lastPage.number + 1),
    staleTime: 1000 * 30,
  });
}
