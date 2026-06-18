import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { verifyWathq } from './verify-wathq';

describe('verifyWathq', () => {
  it('POSTs { nationalId, crNumber } to /wathq/verify and returns the result', async () => {
    let method = '';
    let pathname = '';
    let body: unknown;
    server.use(
      http.post('*/wathq/verify', async ({ request }) => {
        method = request.method;
        pathname = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ authorized: true, isCrFound: true, isNidFound: true });
      }),
    );

    const res = await verifyWathq({ nationalId: '1122334455', crNumber: '1010101010' });

    expect(method).toBe('POST');
    expect(pathname).toMatch(/\/wathq\/verify$/);
    expect(body).toEqual({ nationalId: '1122334455', crNumber: '1010101010' });
    expect(res.authorized).toBe(true);
  });

  it('surfaces a not-authorized result verbatim (authorized:false + flags)', async () => {
    server.use(
      http.post('*/wathq/verify', () =>
        HttpResponse.json({ authorized: false, isCrFound: true, isNidFound: false }),
      ),
    );
    const res = await verifyWathq({ nationalId: '1122334455', crNumber: '1010101010' });
    expect(res.authorized).toBe(false);
    expect(res.isNidFound).toBe(false);
  });

  it('rejects a malformed CR number before any request (strict request schema)', async () => {
    let hit = false;
    server.use(
      http.post('*/wathq/verify', () => {
        hit = true;
        return HttpResponse.json({ authorized: true });
      }),
    );
    await expect(verifyWathq({ nationalId: '1122334455', crNumber: '123' })).rejects.toThrow();
    expect(hit).toBe(false);
  });

  it('throws ApiError on a 4xx with messageEn / errorCode populated', async () => {
    server.use(
      http.post('*/wathq/verify', () =>
        HttpResponse.json(
          {
            messageEn: 'Wathq service unavailable.',
            messageAr: 'خدمة واثق غير متاحة.',
            errorCode: 'WATHQ_DOWN',
          },
          { status: 502 },
        ),
      ),
    );
    const err = await verifyWathq({ nationalId: '1122334455', crNumber: '1010101010' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(502);
    expect((err as ApiError).messageEn).toBe('Wathq service unavailable.');
    expect((err as ApiError).messageAr).toBe('خدمة واثق غير متاحة.');
    expect((err as ApiError).errorCode).toBe('WATHQ_DOWN');
  });
});
