import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { removeService } from './remove-service';

describe('removeService', () => {
  it('issues a DELETE to /technician/services/remove/:serviceId', async () => {
    let method: string | undefined;
    let url: string | undefined;
    server.use(
      http.delete('*/technician/services/remove/:serviceId', ({ request }) => {
        method = request.method;
        url = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(removeService(42)).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
    expect(url).toContain('/technician/services/remove/42');
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.delete('*/technician/services/remove/:serviceId', () =>
        HttpResponse.json({ messageEn: 'Not found' }, { status: 404 }),
      ),
    );
    const err = await removeService(99).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});
