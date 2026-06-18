import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { ticketDetailQueryKey } from '../lib/ticket-format';
import { type SupportTicket } from '../schemas/ticket';

/**
 * One ticket including its message thread. Mirrors GET /support/tickets/:id. Permissive
 * response (rule 1) — `messages` may be absent on some deployments.
 */
export async function getTicket(id: number): Promise<SupportTicket> {
  return apiClient.get<SupportTicket>(
    API_ENDPOINTS.SUPPORT.TICKET_BY_ID.replace(':id', String(id)),
  );
}

/** Fetches only when a ticket id is selected (the detail modal is open). */
export function useTicket(id: number | null) {
  return useQuery({
    queryKey: ticketDetailQueryKey(id ?? 0),
    queryFn: () => getTicket(id as number),
    enabled: id !== null,
    staleTime: 1000 * 10,
  });
}
