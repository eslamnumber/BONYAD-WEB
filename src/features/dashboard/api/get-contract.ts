import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import type { Contract } from '../schemas/contract';

export const contractQueryKey = (projectId: number) => ['projects', 'contract', projectId] as const;

/**
 * The project's contract record, or `null` when none exists yet. Mirrors the RN
 * call site website-bonyad/src/services/ContractService.ts:35 — GET
 * /contracts/project/:projectId, where a 404 means "no contract" (not an error)
 * and the body may be `{ contract: {...} }` or the contract object directly.
 * Browser calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getContractByProject(projectId: number): Promise<Contract | null> {
  const path = API_ENDPOINTS.CONTRACTS.BY_PROJECT.replace(':projectId', String(projectId));
  try {
    const data = await apiClient.get<unknown>(path);
    return unwrapContract(data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function unwrapContract(data: unknown): Contract | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  return (root.contract as Contract | undefined) ?? (root as Contract) ?? null;
}

export function useContractByProject(projectId: number) {
  return useQuery({
    queryKey: contractQueryKey(projectId),
    queryFn: () => getContractByProject(projectId),
    staleTime: 1000 * 60 * 5,
  });
}
