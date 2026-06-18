import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyRefundRequests } from './get-my-refund-requests';

const REFUND = {
  id: 5001,
  transactionId: 9001,
  amount: 25000,
  currency: 'SAR',
  reason: 'Service not delivered as agreed',
  status: 'PENDING',
  createdAt: '2026-06-12T09:00:00Z',
};

describe('getMyRefundRequests', () => {
  it('unwraps a Spring page and reports isLast from `last`', async () => {
    server.use(
      http.get('*/payments/my-refund-requests', () =>
        HttpResponse.json({
          content: [REFUND],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          last: true,
        }),
      ),
    );
    const page = await getMyRefundRequests();
    expect(page.items.map((r) => r.id)).toEqual([5001]);
    expect(page.isLast).toBe(true);
  });

  it('sends page / size as query params', async () => {
    let url = '';
    server.use(
      http.get('*/payments/my-refund-requests', ({ request }) => {
        url = request.url;
        return HttpResponse.json({ content: [REFUND], totalPages: 2, number: 0, last: false });
      }),
    );
    const page = await getMyRefundRequests(0, 20);
    const params = new URL(url).searchParams;
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('20');
    expect(page.isLast).toBe(false);
  });

  it('treats a bare array body as a single final page', async () => {
    server.use(http.get('*/payments/my-refund-requests', () => HttpResponse.json([REFUND])));
    const page = await getMyRefundRequests();
    expect(page.items).toHaveLength(1);
    expect(page.isLast).toBe(true);
  });

  it('throws ApiError with localized messages on 500', async () => {
    server.use(
      http.get('*/payments/my-refund-requests', () =>
        HttpResponse.json(
          { messageEn: 'Server error.', messageAr: 'خطأ في الخادم.', errorCode: 'SERVER_ERROR' },
          { status: 500 },
        ),
      ),
    );
    const err = await getMyRefundRequests().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).localizedMessage('en')).toBe('Server error.');
  });
});
