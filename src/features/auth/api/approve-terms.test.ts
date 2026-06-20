import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { approveTerms } from './approve-terms';

describe('approveTerms', () => {
  it('posts { termsId } with the Bearer token, matching the iOS approve call', async () => {
    const seen: { body?: unknown; auth?: string | null } = {};
    server.use(
      http.post('*/users/terms/approve', async ({ request }) => {
        seen.body = await request.json();
        seen.auth = request.headers.get('authorization');
        return HttpResponse.json({ success: true });
      }),
    );
    await approveTerms(17, 'jwt-xyz');
    expect(seen.body).toEqual({ termsId: 17 });
    expect(seen.auth).toBe('Bearer jwt-xyz');
  });

  it('resolves when the backend returns 2xx without a success field', async () => {
    server.use(http.post('*/users/terms/approve', () => HttpResponse.json({})));
    await expect(approveTerms(17, 'tok')).resolves.toBeUndefined();
  });

  it('throws ApiError with the localised envelope on a 4xx', async () => {
    server.use(
      http.post('*/users/terms/approve', () =>
        HttpResponse.json(
          {
            messageEn: 'Unknown terms.',
            messageAr: 'شروط غير معروفة.',
            errorCode: 'TERMS_NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    );
    const err = await approveTerms(99, 'tok').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('TERMS_NOT_FOUND');
    expect((err as ApiError).localizedMessage('ar')).toBe('شروط غير معروفة.');
  });

  it('rejects an invalid termsId at the request boundary', async () => {
    await expect(approveTerms(0, 'tok')).rejects.toBeTruthy();
  });
});
