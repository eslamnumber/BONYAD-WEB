import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { ReferralList } from '../types/referral';

import { getReferrals } from './get-referrals';

/** Mirrors a GET /users/me/referrals body: one converted referral + one pending invite. */
const LIST: ReferralList = {
  referrals: [
    {
      id: 1,
      referred: { id: 9, name: 'Lina', phone_number: '512345678' },
      status: 'CONVERTED',
      reward_tier: { id: 1, threshold: 1, reward_amount: 50 },
      converted_at: '2026-06-10T00:00:00.000',
    },
  ],
  invitations: [{ id: 2, invited_phone: '598765432', status: 'PENDING', sms_sent: true }],
};

describe('getReferrals', () => {
  it('returns the invitations + referrals body as-is', async () => {
    server.use(http.get('*/users/me/referrals', () => HttpResponse.json(LIST)));
    expect(await getReferrals()).toEqual(LIST);
  });

  it('folds a 404 to an empty list (nothing invited yet → empty state, not an error)', async () => {
    server.use(http.get('*/users/me/referrals', () => new HttpResponse(null, { status: 404 })));
    expect(await getReferrals()).toEqual({ invitations: [], referrals: [] });
  });

  it('throws ApiError on a non-404 failure', async () => {
    server.use(
      http.get('*/users/me/referrals', () =>
        HttpResponse.json({ messageEn: 'Boom', errorCode: 'SERVER_ERROR' }, { status: 500 }),
      ),
    );
    const err = await getReferrals().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });
});
