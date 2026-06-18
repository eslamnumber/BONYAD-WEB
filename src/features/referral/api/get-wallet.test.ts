import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getReferralWallet } from './get-wallet';

describe('getReferralWallet', () => {
  it('returns the wallet body as-is', async () => {
    const wallet = { user_id: 444, balance: 150, currency: 'SAR' };
    server.use(http.get('*/users/me/wallet', () => HttpResponse.json(wallet)));
    expect(await getReferralWallet()).toEqual(wallet);
  });

  it('folds a 404 to null (no wallet yet → 0 balance, not an error)', async () => {
    server.use(http.get('*/users/me/wallet', () => new HttpResponse(null, { status: 404 })));
    expect(await getReferralWallet()).toBeNull();
  });

  it('throws ApiError on a non-404 failure', async () => {
    server.use(
      http.get('*/users/me/wallet', () =>
        HttpResponse.json({ messageEn: 'Boom', errorCode: 'SERVER_ERROR' }, { status: 500 }),
      ),
    );
    const err = await getReferralWallet().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });
});
