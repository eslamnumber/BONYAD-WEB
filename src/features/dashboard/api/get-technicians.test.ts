import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTechnicians } from './get-technicians';

const TECH = {
  id: 7,
  name: 'خالد اليوسف',
  phoneNumber: '0501234567',
  averageRating: 4.9,
  totalReviews: 32,
  profileImage: null,
};

describe('getTechnicians', () => {
  it('returns the bare technicians array as-is', async () => {
    server.use(http.get('*/users/technicians', () => HttpResponse.json([TECH])));
    expect(await getTechnicians()).toEqual([TECH]);
  });

  it('forwards searchQuery and serviceId as query params', async () => {
    let captured: URL | undefined;
    server.use(
      http.get('*/users/technicians', ({ request }) => {
        captured = new URL(request.url);
        return HttpResponse.json([TECH]);
      }),
    );
    await getTechnicians({ searchQuery: 'خالد', serviceId: 3 });
    expect(captured?.searchParams.get('searchQuery')).toBe('خالد');
    expect(captured?.searchParams.get('serviceId')).toBe('3');
  });

  it('omits unset query params', async () => {
    let captured: URL | undefined;
    server.use(
      http.get('*/users/technicians', ({ request }) => {
        captured = new URL(request.url);
        return HttpResponse.json([]);
      }),
    );
    await getTechnicians();
    expect(captured?.searchParams.has('searchQuery')).toBe(false);
    expect(captured?.searchParams.has('serviceId')).toBe(false);
  });

  it('unwraps a paginated page envelope', async () => {
    server.use(
      http.get('*/users/technicians', () =>
        HttpResponse.json({ content: [TECH], totalElements: 1 }),
      ),
    );
    expect((await getTechnicians()).map((t) => t.id)).toEqual([7]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/users/technicians', () => HttpResponse.json({ oops: true })));
    expect(await getTechnicians()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/users/technicians', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getTechnicians().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
  });
});
