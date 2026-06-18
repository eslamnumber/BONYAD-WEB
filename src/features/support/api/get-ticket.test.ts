import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTicket } from './get-ticket';

describe('getTicket', () => {
  it('requests the :id path and returns the ticket with its messages', async () => {
    let path = '';
    server.use(
      http.get('*/support/tickets/:id', ({ params, request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({
          id: Number(params.id),
          subject: 'Billing',
          status: 'IN_PROGRESS',
          messages: [
            { id: 1, content: 'Hi', isAdminMessage: true, createdAt: '2026-06-01T09:00:00Z' },
          ],
        });
      }),
    );
    const ticket = await getTicket(8);
    expect(path.endsWith('/support/tickets/8')).toBe(true);
    expect(ticket.messages?.[0]?.content).toBe('Hi');
  });

  it('throws ApiError on 404', async () => {
    server.use(
      http.get('*/support/tickets/:id', () =>
        HttpResponse.json({ messageEn: 'Not found.', errorCode: 'NOT_FOUND' }, { status: 404 }),
      ),
    );
    const err = await getTicket(9).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});
