import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getAllServices } from './get-all-services';

const CATEGORY = { id: 1, nameEn: 'Construction', nameAr: 'البناء', isCategory: true };
const SUBCATEGORY = {
  id: 11,
  nameEn: 'Finishing contractor',
  nameAr: 'مقاول تشطيبات',
  isCategory: false,
  parentService: { id: 1, nameEn: 'Construction', nameAr: 'البناء' },
};

describe('getAllServices', () => {
  it('returns the bare services array (categories + subcategories) as-is', async () => {
    server.use(http.get('*/services', () => HttpResponse.json([CATEGORY, SUBCATEGORY])));
    expect(await getAllServices()).toEqual([CATEGORY, SUBCATEGORY]);
  });

  it('unwraps a paginated page envelope', async () => {
    server.use(
      http.get('*/services', () =>
        HttpResponse.json({ content: [CATEGORY, SUBCATEGORY], totalElements: 2 }),
      ),
    );
    expect((await getAllServices()).map((s) => s.id)).toEqual([1, 11]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/services', () => HttpResponse.json({ oops: true })));
    expect(await getAllServices()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/services', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getAllServices().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
