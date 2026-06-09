import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { deleteBid } from './delete-bid';

describe('deleteBid', () => {
  it('DELETEs /bids/:id and resolves on success', async () => {
    let method: string | undefined;
    let path: string | undefined;
    server.use(
      http.delete('*/bids/:id', ({ request, params }) => {
        method = request.method;
        path = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(deleteBid(123)).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
    expect(path).toBe('123');
  });

  it('throws ApiError when the backend rejects the withdrawal', async () => {
    server.use(
      http.delete('*/bids/:id', () =>
        HttpResponse.json({ messageEn: 'Cannot withdraw an accepted bid.' }, { status: 400 }),
      ),
    );
    const err = await deleteBid(123).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
