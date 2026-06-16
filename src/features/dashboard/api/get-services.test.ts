import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getServices } from './get-services';

const SERVICE = { id: 1, nameEn: 'Construction', nameAr: 'البناء', isCategory: true };

describe('getServices', () => {
  it('returns the bare category array as-is', async () => {
    server.use(http.get('*/services/categories', () => HttpResponse.json([SERVICE])));
    expect(await getServices()).toEqual([SERVICE]);
  });

  it('unwraps a paginated page envelope', async () => {
    server.use(
      http.get('*/services/categories', () =>
        HttpResponse.json({ content: [SERVICE], totalElements: 1 }),
      ),
    );
    expect((await getServices()).map((s) => s.id)).toEqual([1]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/services/categories', () => HttpResponse.json({ oops: true })));
    expect(await getServices()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/services/categories', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getServices().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
