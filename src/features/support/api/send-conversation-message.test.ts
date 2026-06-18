import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { sendConversationMessage } from './send-conversation-message';

describe('sendConversationMessage', () => {
  it('posts { roomId, receiverId, content } to /chat/send', async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post('*/chat/send', async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true });
      }),
    );

    await sendConversationMessage({ roomId: 'r1', receiverId: 9, content: 'Hi team' });
    expect(captured).toEqual({ roomId: 'r1', receiverId: 9, content: 'Hi team' });
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.post('*/chat/send', () => HttpResponse.json({ messageEn: 'Empty.' }, { status: 400 })),
    );
    const err = await sendConversationMessage({ roomId: 'r1', receiverId: 9, content: 'x' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
