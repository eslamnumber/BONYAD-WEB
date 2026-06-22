import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { addServices } from './add-services';

describe('addServices', () => {
  it('POSTs { serviceIds } to /technician/services/add', async () => {
    let body: unknown;
    server.use(
      http.post('*/technician/services/add', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, count: 2 });
      }),
    );
    await expect(addServices([1, 2])).resolves.toBeUndefined();
    expect(body).toEqual({ serviceIds: [1, 2] });
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.post('*/technician/services/add', () =>
        HttpResponse.json({ messageEn: 'Bad request' }, { status: 400 }),
      ),
    );
    const err = await addServices([1]).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
