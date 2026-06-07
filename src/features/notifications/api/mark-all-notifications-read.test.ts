import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { markAllNotificationsRead } from './mark-all-notifications-read';

describe('markAllNotificationsRead', () => {
  it('POSTs to /notifications/mark-all-read and resolves', async () => {
    let called = false;
    server.use(
      http.post('*/notifications/mark-all-read', () => {
        called = true;
        return HttpResponse.json({ success: true });
      }),
    );
    await expect(markAllNotificationsRead()).resolves.toBeUndefined();
    expect(called).toBe(true);
  });

  it('throws ApiError on 401', async () => {
    server.use(
      http.post('*/notifications/mark-all-read', () =>
        HttpResponse.json({ errorCode: 'UNAUTHORIZED' }, { status: 401 }),
      ),
    );
    const err = await markAllNotificationsRead().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
