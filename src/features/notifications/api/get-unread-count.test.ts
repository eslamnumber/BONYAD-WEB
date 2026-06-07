import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getUnreadCount } from './get-unread-count';

describe('getUnreadCount', () => {
  it('reads the count from a `{ count }` envelope', async () => {
    server.use(http.get('*/notifications/unread-count', () => HttpResponse.json({ count: 9 })));
    expect(await getUnreadCount()).toBe(9);
  });

  it('reads the count from a bare number body', async () => {
    server.use(http.get('*/notifications/unread-count', () => HttpResponse.json(4)));
    expect(await getUnreadCount()).toBe(4);
  });

  it('reads the count from a `{ unreadCount }` envelope', async () => {
    server.use(
      http.get('*/notifications/unread-count', () => HttpResponse.json({ unreadCount: 2 })),
    );
    expect(await getUnreadCount()).toBe(2);
  });

  it('returns 0 when the body shape is unexpected', async () => {
    server.use(http.get('*/notifications/unread-count', () => HttpResponse.json({ nope: true })));
    expect(await getUnreadCount()).toBe(0);
  });

  it('throws ApiError on 401', async () => {
    server.use(
      http.get('*/notifications/unread-count', () =>
        HttpResponse.json({ errorCode: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );
    const err = await getUnreadCount().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
  });
});
