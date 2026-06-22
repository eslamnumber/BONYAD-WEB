import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getAllServices } from './get-all-services';

describe('getAllServices', () => {
  it('returns the parsed services from GET /services', async () => {
    server.use(
      http.get('*/services', () =>
        HttpResponse.json({ services: [{ id: 10, nameEn: 'Tiling', nameAr: 'بلاط' }] }),
      ),
    );
    const result = await getAllServices();
    expect(result[0]?.id).toBe(10);
  });

  it('throws ApiError on a 5xx', async () => {
    server.use(http.get('*/services', () => HttpResponse.json({}, { status: 500 })));
    const err = await getAllServices().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });
});
