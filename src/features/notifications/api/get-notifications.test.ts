import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getNotifications } from './get-notifications';

const ACCEPTED = {
  id: 1,
  type: 'BID_ACCEPTED',
  read: false,
  titleEn: 'Your offer was accepted',
  titleAr: 'تم قبول عرضك',
  messageEn: 'A new project is available in your area.',
  messageAr: 'مشروع جديد متاح في منطقتك.',
  createdAt: '2026-10-15T13:00:00Z',
};
const REJECTED = { id: 2, type: 'BID_REJECTED', read: true, title: 'تم رفض عرضك' };

describe('getNotifications', () => {
  it('returns the notifications from a paginated body', async () => {
    server.use(
      http.get('*/notifications/my-notifications', () =>
        HttpResponse.json({ content: [ACCEPTED, REJECTED], totalElements: 2 }),
      ),
    );
    const notifications = await getNotifications();
    expect(notifications.map((n) => n.id)).toEqual([1, 2]);
  });

  it('accepts a bare array body (non-paginated) for backend flexibility', async () => {
    server.use(http.get('*/notifications/my-notifications', () => HttpResponse.json([ACCEPTED])));
    const notifications = await getNotifications();
    expect(notifications).toEqual([ACCEPTED]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(
      http.get('*/notifications/my-notifications', () =>
        HttpResponse.json({ unexpected: 'shape' }),
      ),
    );
    expect(await getNotifications()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/notifications/my-notifications', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getNotifications().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
