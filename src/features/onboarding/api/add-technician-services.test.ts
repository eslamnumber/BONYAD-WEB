import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { addTechnicianServices } from './add-technician-services';

describe('addTechnicianServices', () => {
  it('POSTs { serviceIds } to /technician/services/add and resolves void', async () => {
    let body: unknown;
    server.use(
      http.post('*/technician/services/add', async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(addTechnicianServices([101, 102])).resolves.toBeUndefined();
    expect(body).toEqual({ serviceIds: [101, 102] });
  });

  it('throws ApiError on failure', async () => {
    server.use(
      http.post('*/technician/services/add', () =>
        HttpResponse.json({ messageEn: 'Bad request', errorCode: 'BAD' }, { status: 400 }),
      ),
    );
    const err = await addTechnicianServices([1]).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('BAD');
  });
});
