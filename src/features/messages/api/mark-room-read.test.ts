import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { markRoomRead } from './mark-room-read';

const ENDPOINT = '*/chat/rooms/:roomId/mark-all-read';

describe('markRoomRead', () => {
  it('POSTs to the room-scoped path', async () => {
    let method = '';
    let path = '';
    server.use(
      http.post(ENDPOINT, ({ request }) => {
        method = request.method;
        path = new URL(request.url).pathname;
        return HttpResponse.json({ ok: true });
      }),
    );
    await markRoomRead('room-1');
    expect(method).toBe('POST');
    expect(path).toContain('/chat/rooms/room-1/mark-all-read');
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.post(ENDPOINT, () => HttpResponse.json({ errorCode: 'FORBIDDEN' }, { status: 403 })),
    );
    const err = await markRoomRead('room-1').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
