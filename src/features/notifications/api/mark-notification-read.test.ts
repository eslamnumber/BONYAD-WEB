import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { markNotificationRead } from './mark-notification-read';

describe('markNotificationRead', () => {
  it('POSTs to /notifications/:id/read with the given id', async () => {
    let capturedUrl = '';
    server.use(
      http.post('*/notifications/:id/read', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ success: true });
      }),
    );
    await markNotificationRead(42);
    expect(capturedUrl).toContain('/notifications/42/read');
  });

  it('throws ApiError with localized messages on 404', async () => {
    server.use(
      http.post('*/notifications/:id/read', () =>
        HttpResponse.json(
          { messageEn: 'Not found.', messageAr: 'غير موجود.', errorCode: 'NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );
    const err = await markNotificationRead(1).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).localizedMessage('ar')).toBe('غير موجود.');
  });
});
