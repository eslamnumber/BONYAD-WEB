import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { acceptBid } from './accept-bid';

describe('acceptBid', () => {
  it('POSTs /bids/:id/accept and resolves on success', async () => {
    let method = '';
    let capturedUrl = '';
    server.use(
      http.post('*/bids/:id/accept', ({ request }) => {
        method = request.method;
        capturedUrl = request.url;
        return HttpResponse.json({ status: 'ACCEPTED' });
      }),
    );
    await expect(acceptBid(7)).resolves.toBeUndefined();
    expect(method).toBe('POST');
    expect(new URL(capturedUrl).pathname).toMatch(/\/bids\/7\/accept$/);
  });

  it('throws ApiError with status / localized messages on 400', async () => {
    server.use(
      http.post('*/bids/:id/accept', () =>
        HttpResponse.json(
          { messageEn: 'Already accepted.', messageAr: 'تم القبول بالفعل.', errorCode: 'CONFLICT' },
          { status: 400 },
        ),
      ),
    );
    const err = await acceptBid(7).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('CONFLICT');
    expect((err as ApiError).localizedMessage('ar')).toBe('تم القبول بالفعل.');
  });
});
