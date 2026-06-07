import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyChats } from './get-my-chats';

const ROOM = {
  roomId: 'room-1',
  otherUserName: 'أحمد العتيبي',
  otherUserRole: 'USER',
  lastMessage: 'مرحباً',
  lastMessageAt: '2026-06-07T10:00:00Z',
  unreadCount: 2,
};
const ENDPOINT = '*/chat/my-chats';

describe('getMyChats', () => {
  it('returns a bare-array body unchanged', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json([ROOM])));
    expect(await getMyChats()).toEqual([ROOM]);
  });

  it('unwraps the rooms from a { data } envelope', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ data: [ROOM] })));
    expect(await getMyChats()).toEqual([ROOM]);
  });

  it('unwraps the legacy { chatRooms } envelope for backend flexibility', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ chatRooms: [ROOM] })));
    expect(await getMyChats()).toEqual([ROOM]);
  });

  it('drops rows without a usable roomId (unkeyable / unopenable)', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json([ROOM, { otherUserName: 'no room' }, { roomId: '' }]),
      ),
    );
    expect(await getMyChats()).toEqual([ROOM]);
  });

  it('returns [] for an unexpected body shape', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json({ unexpected: 'shape' })));
    expect(await getMyChats()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getMyChats().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
