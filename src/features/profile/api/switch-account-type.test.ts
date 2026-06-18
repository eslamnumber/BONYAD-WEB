import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { switchAccountType, WathqNotAuthorizedError } from './switch-account-type';

describe('switchAccountType', () => {
  it('switches to Individual with a single PUT /users/:userId/profile { isCompany:false }', async () => {
    let method = '';
    let pathname = '';
    let body: unknown;
    server.use(
      http.put('*/users/:userId/profile', async ({ request }) => {
        method = request.method;
        pathname = new URL(request.url).pathname;
        body = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    await switchAccountType(7, { mode: 'individual' });

    expect(method).toBe('PUT');
    expect(pathname).toMatch(/\/users\/7\/profile$/);
    expect(body).toEqual({ isCompany: false });
  });

  it('switches to Company only after Wathq authorizes, then PUTs the full body', async () => {
    let verified: unknown;
    let putBody: unknown;
    server.use(
      http.post('*/wathq/verify', async ({ request }) => {
        verified = await request.json();
        return HttpResponse.json({ authorized: true, isCrFound: true, isNidFound: true });
      }),
      http.put('*/users/:userId/profile', async ({ request }) => {
        putBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    await switchAccountType(7, {
      mode: 'company',
      companyName: 'مؤسسة العتيبي للمقاولات',
      crNumber: '1010101010',
      nationalId: '1122334455',
    });

    expect(verified).toEqual({ nationalId: '1122334455', crNumber: '1010101010' });
    expect(putBody).toEqual({
      isCompany: true,
      companyName: 'مؤسسة العتيبي للمقاولات',
      crNumber: '1010101010',
      nationalId: '1122334455',
    });
  });

  it('throws WathqNotAuthorizedError (with flags) and never PUTs when not authorized', async () => {
    let putCalled = false;
    server.use(
      http.post('*/wathq/verify', () =>
        HttpResponse.json({ authorized: false, isCrFound: false, isNidFound: true }),
      ),
      http.put('*/users/:userId/profile', () => {
        putCalled = true;
        return HttpResponse.json({ ok: true });
      }),
    );

    const err = await switchAccountType(7, {
      mode: 'company',
      companyName: 'X',
      crNumber: '1010101010',
      nationalId: '1122334455',
    }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(WathqNotAuthorizedError);
    expect((err as WathqNotAuthorizedError).result.isCrFound).toBe(false);
    expect(putCalled).toBe(false);
  });

  it('throws ApiError when the profile PUT fails', async () => {
    server.use(
      http.put('*/users/:userId/profile', () =>
        HttpResponse.json(
          { messageEn: 'Update failed.', errorCode: 'PROFILE_UPDATE_FAILED' },
          { status: 400 },
        ),
      ),
    );
    const err = await switchAccountType(7, { mode: 'individual' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('PROFILE_UPDATE_FAILED');
  });
});
