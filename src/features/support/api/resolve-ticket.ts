import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { ticketDetailQueryKey, ticketsRootKey } from '../lib/ticket-format';
import { type SupportTicket } from '../schemas/ticket';

/** Mark a ticket resolved. Mirrors PUT /support/tickets/:id/resolve (no body). */
export async function resolveTicket(id: number): Promise<SupportTicket> {
  return apiClient.put<SupportTicket>(
    API_ENDPOINTS.SUPPORT.TICKET_RESOLVE.replace(':id', String(id)),
  );
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, number>({
    mutationFn: resolveTicket,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ticketDetailQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: ticketsRootKey() });
    },
  });
}
