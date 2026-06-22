import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { rejectBid } from './reject-bid';

describe('rejectBid', () => {
  it('POSTs /bids/:id/reject and resolves on success', async () => {
    let method = '';
    let capturedUrl = '';
    server.use(
      http.post('*/bids/:id/reject', ({ request }) => {
        method = request.method;
        capturedUrl = request.url;
        return HttpResponse.json({ status: 'REJECTED' });
      }),
    );
    await expect(rejectBid(88)).resolves.toBeUndefined();
    expect(method).toBe('POST');
    expect(new URL(capturedUrl).pathname).toMatch(/\/bids\/88\/reject$/);
  });

  it('throws ApiError with the status on the plain { error } 400 the backend returns', async () => {
    server.use(
      http.post('*/bids/:id/reject', () =>
        HttpResponse.json({ error: 'Bid not found' }, { status: 400 }),
      ),
    );
    const err = await rejectBid(999999).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
