import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getRegions } from './get-regions';

const REGION = { id: 1, nameEn: 'Riyadh', nameAr: 'الرياض', techniciansCount: 12 };

describe('getRegions', () => {
  it('returns the bare region array as-is', async () => {
    server.use(http.get('*/regions', () => HttpResponse.json([REGION])));
    expect(await getRegions()).toEqual([REGION]);
  });

  it('unwraps a paginated page envelope', async () => {
    server.use(
      http.get('*/regions', () => HttpResponse.json({ content: [REGION], totalElements: 1 })),
    );
    expect((await getRegions()).map((r) => r.id)).toEqual([1]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/regions', () => HttpResponse.json({ oops: true })));
    expect(await getRegions()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/regions', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getRegions().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
