import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { markMessageRead } from './mark-message-read';

const ENDPOINT = '*/chat/messages/:messageId/mark-read';

describe('markMessageRead', () => {
  it('POSTs to the message-scoped path', async () => {
    let method = '';
    let path = '';
    server.use(
      http.post(ENDPOINT, ({ request }) => {
        method = request.method;
        path = new URL(request.url).pathname;
        return HttpResponse.json({ ok: true });
      }),
    );
    await markMessageRead(99);
    expect(method).toBe('POST');
    expect(path).toContain('/chat/messages/99/mark-read');
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.post(ENDPOINT, () => HttpResponse.json({ errorCode: 'NOT_FOUND' }, { status: 404 })),
    );
    const err = await markMessageRead(99).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});
