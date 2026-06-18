import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTickets } from './get-tickets';

const A = { id: 1, subject: 'Old', status: 'CLOSED', createdAt: '2026-05-01T09:00:00Z' };
const B = { id: 2, subject: 'New', status: 'OPEN', createdAt: '2026-06-01T09:00:00Z' };

describe('getTickets', () => {
  it('returns tickets newest-first and omits the status param for ALL', async () => {
    let qs = 'unset';
    server.use(
      http.get('*/support/tickets', ({ request }) => {
        qs = new URL(request.url).searchParams.get('status') ?? 'none';
        return HttpResponse.json([A, B]);
      }),
    );
    const list = await getTickets('ALL');
    expect(qs).toBe('none');
    expect(list.map((t) => t.id)).toEqual([2, 1]);
  });

  it('forwards the status filter as a query param', async () => {
    let qs = '';
    server.use(
      http.get('*/support/tickets', ({ request }) => {
        qs = new URL(request.url).searchParams.get('status') ?? '';
        return HttpResponse.json({ tickets: [B] });
      }),
    );
    expect(await getTickets('OPEN')).toHaveLength(1);
    expect(qs).toBe('OPEN');
  });

  it('throws ApiError with localized messages on 401', async () => {
    server.use(
      http.get('*/support/tickets', () =>
        HttpResponse.json(
          { messageEn: 'No.', messageAr: 'لا.', errorCode: 'AUTH' },
          { status: 401 },
        ),
      ),
    );
    const err = await getTickets('ALL').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).localizedMessage('ar')).toBe('لا.');
  });
});
