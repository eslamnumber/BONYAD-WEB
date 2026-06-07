import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { sendMessage } from './send-message';

const ENDPOINT = '*/chat/send';

describe('sendMessage', () => {
  it('posts the message and returns the persisted entity', async () => {
    let captured: unknown;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ id: 5, roomId: 'room-1', content: 'hi' });
      }),
    );
    const result = await sendMessage({ roomId: 'room-1', receiverId: 42, content: 'hi' });
    expect(captured).toEqual({ roomId: 'room-1', receiverId: 42, content: 'hi' });
    expect(result).toEqual({ id: 5, roomId: 'room-1', content: 'hi' });
  });

  it('trims content and forwards projectId when present', async () => {
    let captured: Record<string, unknown> = {};
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 6 });
      }),
    );
    await sendMessage({ roomId: 'room-1', receiverId: 42, content: '  hi  ', projectId: 9 });
    expect(captured.content).toBe('hi');
    expect(captured.projectId).toBe(9);
  });

  it('rejects a whitespace-only body before any request is made', async () => {
    let called = false;
    server.use(
      http.post(ENDPOINT, () => {
        called = true;
        return HttpResponse.json({});
      }),
    );
    await expect(
      sendMessage({ roomId: 'room-1', receiverId: 42, content: '   ' }),
    ).rejects.toThrow();
    expect(called).toBe(false);
  });

  it('throws ApiError on a 4xx from the backend', async () => {
    server.use(
      http.post(ENDPOINT, () =>
        HttpResponse.json({ messageEn: 'Blocked.', errorCode: 'BLOCKED' }, { status: 403 }),
      ),
    );
    const err = await sendMessage({ roomId: 'r', receiverId: 1, content: 'x' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
    expect((err as ApiError).errorCode).toBe('BLOCKED');
  });
});
