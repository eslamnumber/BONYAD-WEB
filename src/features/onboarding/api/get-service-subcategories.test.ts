import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getServiceSubcategories } from './get-service-subcategories';

describe('getServiceSubcategories', () => {
  it('substitutes :categoryId into the path and returns the subcategories', async () => {
    let url: string | undefined;
    server.use(
      http.get('*/services/:categoryId/subcategories', ({ request }) => {
        url = request.url;
        return HttpResponse.json([{ id: 101, nameEn: 'Pipe repair', parentService: { id: 10 } }]);
      }),
    );
    const list = await getServiceSubcategories(10);
    expect(url).toContain('/services/10/subcategories');
    expect(list[0]).toMatchObject({ id: 101 });
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.get('*/services/:categoryId/subcategories', () =>
        HttpResponse.json({ messageEn: 'Not found', errorCode: 'NOT_FOUND' }, { status: 404 }),
      ),
    );
    const err = await getServiceSubcategories(99).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
  });
});
