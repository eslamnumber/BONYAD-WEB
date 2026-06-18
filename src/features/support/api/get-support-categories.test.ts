import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSupportCategories } from './get-support-categories';

const TREE = [
  {
    id: 1,
    nameEn: 'Billing',
    nameAr: 'الفواتير',
    hasChildren: true,
    children: [{ id: 2, nameEn: 'Refund' }],
  },
];

describe('getSupportCategories', () => {
  it('returns a bare category tree', async () => {
    server.use(http.get('*/support/categories/hierarchy', () => HttpResponse.json(TREE)));
    const cats = await getSupportCategories();
    expect(cats[0]?.children?.[0]?.nameEn).toBe('Refund');
  });

  it('unwraps the { categories } envelope and tolerates an empty body', async () => {
    server.use(
      http.get('*/support/categories/hierarchy', () => HttpResponse.json({ categories: TREE })),
    );
    expect(await getSupportCategories()).toHaveLength(1);

    server.use(http.get('*/support/categories/hierarchy', () => HttpResponse.json({})));
    expect(await getSupportCategories()).toEqual([]);
  });

  it('throws ApiError on 500', async () => {
    server.use(
      http.get('*/support/categories/hierarchy', () =>
        HttpResponse.json({ messageEn: 'Server error.' }, { status: 500 }),
      ),
    );
    const err = await getSupportCategories().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });
});
