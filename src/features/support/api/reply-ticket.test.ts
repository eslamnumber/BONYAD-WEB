import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { replyTicket } from './reply-ticket';

describe('replyTicket', () => {
  it('posts both message and content (trimmed) to the :id messages path', async () => {
    let captured: Record<string, unknown> | null = null;
    let path = '';
    server.use(
      http.post('*/support/tickets/:id/messages', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        path = new URL(request.url).pathname;
        return HttpResponse.json({ id: 4, subject: 'X', status: 'IN_PROGRESS' });
      }),
    );

    await replyTicket({ id: 4, text: '  Any update?  ' });

    expect(path.endsWith('/support/tickets/4/messages')).toBe(true);
    expect(captured).toEqual({ message: 'Any update?', content: 'Any update?' });
  });

  it('throws ApiError on 403', async () => {
    server.use(
      http.post('*/support/tickets/:id/messages', () =>
        HttpResponse.json({ messageEn: 'Closed.', errorCode: 'CLOSED' }, { status: 403 }),
      ),
    );
    const err = await replyTicket({ id: 4, text: 'hi there' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
