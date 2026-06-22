import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { MyContract } from '../schemas/my-contract';

export const myContractsQueryKey = () => ['contracts', 'my'] as const;

/** Pull `MyContract[]` out of the `{ contracts }` envelope; tolerate a bare array. */
function extractContracts(data: unknown): MyContract[] {
  if (Array.isArray(data)) return data as MyContract[];
  if (data && typeof data === 'object') {
    const contracts = (data as { contracts?: MyContract[] }).contracts;
    if (Array.isArray(contracts)) return contracts;
  }
  return [];
}

/**
 * Every contract the signed-in user is party to — GET /contracts/my (role-agnostic).
 * Verified live on the dev backend: `{ userName, contracts, userId, totalContracts }`
 * (customer 443 returned 9, technician 444 returned 0). Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function getMyContracts(): Promise<MyContract[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.CONTRACTS.MY);
  return extractContracts(data);
}

export function useMyContracts() {
  return useQuery({
    queryKey: myContractsQueryKey(),
    queryFn: getMyContracts,
    staleTime: 1000 * 30,
  });
}
