import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { requestRefund } from './request-refund';

describe('requestRefund', () => {
  it('POSTs the reason to /transactions/:id/refund-request and returns the created request', async () => {
    let sentBody: Record<string, unknown> = {};
    let path = '';
    server.use(
      http.post('*/payments/transactions/:id/refund-request', async ({ request, params }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        path = String(params.id);
        return HttpResponse.json(
          { id: 5002, transactionId: 9001, reason: sentBody.reason, status: 'PENDING' },
          { status: 201 },
        );
      }),
    );

    const created = await requestRefund({ transactionId: 9001, reason: 'Wrong service delivered' });
    expect(created.id).toBe(5002);
    expect(created.status).toBe('PENDING');
    expect(path).toBe('9001');
    expect(sentBody.reason).toBe('Wrong service delivered');
  });

  it('rejects a reason under 10 characters before any network call (zod)', async () => {
    await expect(requestRefund({ transactionId: 1, reason: 'too short' })).rejects.toBeTruthy();
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/payments/transactions/:id/refund-request', () =>
        HttpResponse.json(
          { messageEn: 'Already refunded.', messageAr: 'تم الاسترداد.', errorCode: 'CONFLICT' },
          { status: 400 },
        ),
      ),
    );
    const err = await requestRefund({
      transactionId: 9001,
      reason: 'Please refund this charge',
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).localizedMessage('ar')).toBe('تم الاسترداد.');
  });
});
