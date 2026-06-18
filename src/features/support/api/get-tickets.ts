import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { ticketsQueryKey } from '../lib/ticket-format';
import { type SupportTicket, type TicketListBody } from '../schemas/ticket';

function byNewest(a: SupportTicket, b: SupportTicket): number {
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
}

/**
 * The signed-in user's support tickets, newest first, with an optional server status
 * filter (`ALL` → none). Mirrors the iOS Tickets tab — GET /support/tickets?status=.
 * Permissive: bare array or `{ tickets }` / `{ data }` envelope (rule 1).
 */
export async function getTickets(status: string): Promise<SupportTicket[]> {
  const params = status && status !== 'ALL' ? { status } : undefined;
  const data = await apiClient.get<TicketListBody>(API_ENDPOINTS.SUPPORT.TICKETS, { params });
  const list = Array.isArray(data) ? data : (data.tickets ?? data.data ?? []);
  return [...list].sort(byNewest);
}

export function useTickets(status: string) {
  return useQuery({
    queryKey: ticketsQueryKey(status),
    queryFn: () => getTickets(status),
    staleTime: 1000 * 20,
  });
}
