import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { ticketDetailQueryKey } from '../lib/ticket-format';
import { ticketReplySchema, type SupportTicket } from '../schemas/ticket';

/**
 * Post a reply on a ticket. Mirrors POST /support/tickets/:id/messages — the RN client
 * sends both `message` and `content`, so we do too. Strict request (rule 1); invalidates
 * the ticket detail so the new message appears.
 */
export async function replyTicket(input: { id: number; text: string }): Promise<SupportTicket> {
  const text = input.text.trim();
  const body = ticketReplySchema.parse({ message: text, content: text });
  return apiClient.post<SupportTicket>(
    API_ENDPOINTS.SUPPORT.TICKET_MESSAGES.replace(':id', String(input.id)),
    { body },
  );
}

export function useReplyTicket() {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, { id: number; text: string }>({
    mutationFn: replyTicket,
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ticketDetailQueryKey(variables.id) }),
  });
}
