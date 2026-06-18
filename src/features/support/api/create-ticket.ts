import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { ticketsRootKey } from '../lib/ticket-format';
import { createTicketSchema, type SupportTicket, type TicketFormValues } from '../schemas/ticket';

/**
 * Create a support ticket. Mirrors RN `SupportTicketService.createTicket` — POST
 * /support/tickets with `{ subject, description, priority, categoryId?, subcategoryId? }`
 * (file-attachment create is deferred). Strict request body (rule 1); the response is
 * read permissively.
 */
export async function createTicket(values: TicketFormValues): Promise<SupportTicket> {
  const body = createTicketSchema.parse({
    subject: values.subject.trim(),
    description: values.description.trim(),
    priority: values.priority,
    categoryId: values.categoryId ?? undefined,
    subcategoryId: values.subcategoryId ?? undefined,
  });
  return apiClient.post<SupportTicket>(API_ENDPOINTS.SUPPORT.TICKETS, { body });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, TicketFormValues>({
    mutationFn: createTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketsRootKey() }),
  });
}
