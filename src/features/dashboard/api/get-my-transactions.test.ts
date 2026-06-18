import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyTransactions } from './get-my-transactions';

const TXN = {
  id: 9001,
  amount: 25000,
  currency: 'SAR',
  status: 'COMPLETED',
  paymentBrand: 'VISA',
  paymentType: 'PHASE',
  phaseNumber: 1,
  completedAt: '2026-06-10T12:30:00Z',
  canRequestRefund: true,
  hasRefundRequest: false,
};

describe('getMyTransactions', () => {
  it('unwraps a Spring page and reports the page number + isLast (not last)', async () => {
    server.use(
      http.get('*/payments/my-transactions', () =>
        HttpResponse.json({
          content: [TXN],
          totalElements: 5,
          totalPages: 3,
          number: 0,
          last: false,
        }),
      ),
    );
    const page = await getMyTransactions({ page: 0 });
    expect(page.items.map((t) => t.id)).toEqual([9001]);
    expect(page.number).toBe(0);
    expect(page.isLast).toBe(false);
    expect(page.totalElements).toBe(5);
  });

  it('sends page / size and the status filter as query params', async () => {
    let url = '';
    server.use(
      http.get('*/payments/my-transactions', ({ request }) => {
        url = request.url;
        return HttpResponse.json({ content: [TXN], totalPages: 1, number: 1, last: true });
      }),
    );
    await getMyTransactions({ status: 'COMPLETED', page: 1, size: 20 });
    const params = new URL(url).searchParams;
    expect(params.get('status')).toBe('COMPLETED');
    expect(params.get('page')).toBe('1');
    expect(params.get('size')).toBe('20');
  });

  it('omits the status param when no filter is given', async () => {
    let url = '';
    server.use(
      http.get('*/payments/my-transactions', ({ request }) => {
        url = request.url;
        return HttpResponse.json([TXN]);
      }),
    );
    await getMyTransactions();
    expect(new URL(url).searchParams.has('status')).toBe(false);
  });

  it('treats a bare array body as a single final page', async () => {
    server.use(http.get('*/payments/my-transactions', () => HttpResponse.json([TXN])));
    const page = await getMyTransactions({ page: 0 });
    expect(page.items).toHaveLength(1);
    expect(page.isLast).toBe(true);
  });

  it('returns an empty final page when the body shape is unexpected', async () => {
    server.use(
      http.get('*/payments/my-transactions', () => HttpResponse.json({ unexpected: 'shape' })),
    );
    const page = await getMyTransactions({ page: 2 });
    expect(page.items).toEqual([]);
    expect(page.number).toBe(2);
    expect(page.isLast).toBe(true);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/payments/my-transactions', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getMyTransactions().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
