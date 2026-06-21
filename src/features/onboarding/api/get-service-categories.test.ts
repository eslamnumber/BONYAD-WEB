import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getServiceCategories } from './get-service-categories';

describe('getServiceCategories', () => {
  it('returns categories from GET /services/categories', async () => {
    server.use(
      http.get('*/services/categories', () =>
        HttpResponse.json([{ id: 10, nameEn: 'Plumbing', nameAr: 'سباكة', isCategory: true }]),
      ),
    );
    const list = await getServiceCategories();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 10, isCategory: true });
  });

  it('unwraps a Spring page envelope and yields [] on an unexpected shape', async () => {
    server.use(
      http.get('*/services/categories', () => HttpResponse.json({ content: [{ id: 11 }] })),
    );
    expect(await getServiceCategories()).toHaveLength(1);

    server.use(http.get('*/services/categories', () => HttpResponse.json({ nope: 1 })));
    expect(await getServiceCategories()).toEqual([]);
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.get('*/services/categories', () =>
        HttpResponse.json({ messageEn: 'Down', messageAr: 'معطل' }, { status: 500 }),
      ),
    );
    const err = await getServiceCategories().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });
});
