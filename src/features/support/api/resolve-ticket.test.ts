import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { resolveTicket } from './resolve-ticket';

describe('resolveTicket', () => {
  it('PUTs the :id resolve path and returns the updated ticket', async () => {
    let path = '';
    let method = '';
    server.use(
      http.put('*/support/tickets/:id/resolve', ({ request }) => {
        path = new URL(request.url).pathname;
        method = request.method;
        return HttpResponse.json({ id: 6, subject: 'X', status: 'RESOLVED' });
      }),
    );
    const ticket = await resolveTicket(6);
    expect(method).toBe('PUT');
    expect(path.endsWith('/support/tickets/6/resolve')).toBe(true);
    expect(ticket.status).toBe('RESOLVED');
  });

  it('throws ApiError on 409', async () => {
    server.use(
      http.put('*/support/tickets/:id/resolve', () =>
        HttpResponse.json({ messageEn: 'Already closed.', errorCode: 'CONFLICT' }, { status: 409 }),
      ),
    );
    const err = await resolveTicket(6).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
  });
});
