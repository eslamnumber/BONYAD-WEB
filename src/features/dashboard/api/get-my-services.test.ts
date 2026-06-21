import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyTechnicianServices } from './get-my-services';

const SERVICES = [
  { id: 1, nameEn: 'Construction', nameAr: 'البناء' },
  { id: 2, nameEn: 'Interior design', nameAr: 'التصميم الداخلي' },
];

describe('getMyTechnicianServices', () => {
  it('unwraps the `{ services }` envelope (the RN shape) into the bare array', async () => {
    server.use(
      http.get('*/technician/services/my-services', () =>
        HttpResponse.json({ services: SERVICES }),
      ),
    );
    const services = await getMyTechnicianServices();
    expect(services.map((s) => s.id)).toEqual([1, 2]);
  });

  it('accepts a bare array body for backend flexibility', async () => {
    server.use(http.get('*/technician/services/my-services', () => HttpResponse.json(SERVICES)));
    const services = await getMyTechnicianServices();
    expect(services).toEqual(SERVICES);
  });

  it('returns [] for an unexpected body shape (no offers filtered in error)', async () => {
    server.use(
      http.get('*/technician/services/my-services', () =>
        HttpResponse.json({ unexpected: 'shape' }),
      ),
    );
    expect(await getMyTechnicianServices()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/technician/services/my-services', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getMyTechnicianServices().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
