import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getRoomMessages } from './get-room-messages';

const ENDPOINT = '*/chat/room/:roomId/messages';
const MSG = { id: 1, roomId: 'room-1', senderId: 7, receiverId: 42, content: 'مرحباً' };

describe('getRoomMessages', () => {
  it('substitutes the roomId into the path and sends limit=100', async () => {
    let url = '';
    server.use(
      http.get(ENDPOINT, ({ request }) => {
        url = request.url;
        return HttpResponse.json([MSG]);
      }),
    );
    await getRoomMessages('room-1');
    const parsed = new URL(url);
    expect(parsed.pathname).toContain('/chat/room/room-1/messages');
    expect(parsed.searchParams.get('limit')).toBe('100');
  });

  it('returns a bare-array body normalised', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json([MSG])));
    expect(await getRoomMessages('room-1')).toEqual([MSG]);
  });

  it('falls back through body / message / text when content is absent', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json([
          { id: 1, body: 'from-body' },
          { id: 2, message: 'from-message' },
          { id: 3, text: 'from-text' },
        ]),
      ),
    );
    const messages = await getRoomMessages('room-1');
    expect(messages.map((m) => m.content)).toEqual(['from-body', 'from-message', 'from-text']);
  });

  it('unwraps a { messages } envelope', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ messages: [MSG] })));
    expect(await getRoomMessages('room-1')).toEqual([MSG]);
  });

  it('drops rows without a numeric id and rows carrying a foreign roomId', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json([
          MSG,
          { content: 'no id' },
          { id: 2, roomId: 'other-room', content: 'x' },
        ]),
      ),
    );
    expect(await getRoomMessages('room-1')).toEqual([MSG]);
  });

  it('returns [] for an unexpected body shape', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ unexpected: true })));
    expect(await getRoomMessages('room-1')).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 404', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json(
          {
            messageEn: 'Room not found.',
            messageAr: 'الغرفة غير موجودة.',
            errorCode: 'ROOM_NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    );
    const err = await getRoomMessages('room-1').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('ROOM_NOT_FOUND');
    expect((err as ApiError).localizedMessage('ar')).toBe('الغرفة غير موجودة.');
  });
});
