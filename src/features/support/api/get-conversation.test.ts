import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getConversation } from './get-conversation';

const MSG = { id: 1, senderId: 9, content: 'Hello', createdAt: '2026-06-01T09:00:00Z' };

describe('getConversation', () => {
  it('encodes the roomId into the path and returns a bare array', async () => {
    let path = '';
    server.use(
      http.get('*/chat/room/:roomId/messages', ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json([MSG]);
      }),
    );
    const messages = await getConversation('abc-123');
    expect(path.endsWith('/chat/room/abc-123/messages')).toBe(true);
    expect(messages[0]?.content).toBe('Hello');
  });

  it('unwraps the { data } envelope', async () => {
    server.use(http.get('*/chat/room/:roomId/messages', () => HttpResponse.json({ data: [MSG] })));
    expect(await getConversation('r1')).toHaveLength(1);
  });

  it('throws ApiError on 401', async () => {
    server.use(
      http.get('*/chat/room/:roomId/messages', () =>
        HttpResponse.json({ messageEn: 'Unauthorized.' }, { status: 401 }),
      ),
    );
    const err = await getConversation('r1').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
