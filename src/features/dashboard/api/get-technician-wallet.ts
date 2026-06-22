import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { TechnicianWallet } from '../schemas/wallet';

export const technicianWalletQueryKey = () => ['technician', 'wallet'] as const;

/** Unwrap the `{ wallet }` envelope; tolerate a bare wallet object too. */
function extractWallet(data: unknown): TechnicianWallet {
  if (data && typeof data === 'object') {
    const wallet = (data as { wallet?: TechnicianWallet }).wallet;
    if (wallet && typeof wallet === 'object') return wallet;
    return data as TechnicianWallet;
  }
  return {};
}

/**
 * The technician's wallet — GET /technician/wallet. Verified live on the dev backend
 * (technician 444): `{ success, wallet }` carrying `availableBalance` / `inEscrow` /
 * `totalEarned` / `totalPaidOut` / `pendingPayouts` / `currency`. Browser calls go
 * through `/api/proxy/*`, which attaches the session token.
 */
export async function getTechnicianWallet(): Promise<TechnicianWallet> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.WALLET.ME);
  return extractWallet(data);
}

export function useTechnicianWallet() {
  return useQuery({
    queryKey: technicianWalletQueryKey(),
    queryFn: getTechnicianWallet,
    staleTime: 1000 * 30,
  });
}
