import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyServices } from './get-my-technician-services';

describe('getMyServices', () => {
  it('parses the `{ services }` envelope shape', async () => {
    server.use(
      http.get('*/technician/services/my-services', () =>
        HttpResponse.json({ services: [{ id: 1, nameEn: 'Plumbing', nameAr: 'سباكة' }] }),
      ),
    );
    const result = await getMyServices();
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
  });

  it('parses a bare array shape', async () => {
    server.use(
      http.get('*/technician/services/my-services', () =>
        HttpResponse.json([{ id: 2, nameEn: 'Painting' }]),
      ),
    );
    const result = await getMyServices();
    expect(result[0]?.nameEn).toBe('Painting');
  });

  it('yields [] on an unexpected shape', async () => {
    server.use(
      http.get('*/technician/services/my-services', () => HttpResponse.json({ foo: 'bar' })),
    );
    await expect(getMyServices()).resolves.toEqual([]);
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.get('*/technician/services/my-services', () =>
        HttpResponse.json({ messageEn: 'Forbidden', messageAr: 'ممنوع' }, { status: 403 }),
      ),
    );
    const err = await getMyServices().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
