import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { ReferralStats } from '../types/referral';

import { getReferralStats } from './get-referral-stats';

/** Mirrors a hydrated GET /users/me/referrals/stats body. */
const STATS: ReferralStats = {
  total_invited: 8,
  signed_up: 5,
  converted: 3,
  pending: 2,
  wallet_balance: 150,
  next_tier_at: 5,
  next_tier_reward: 100,
};

describe('getReferralStats', () => {
  it('returns the stats body as-is', async () => {
    server.use(http.get('*/users/me/referrals/stats', () => HttpResponse.json(STATS)));
    expect(await getReferralStats()).toEqual(STATS);
  });

  it('folds a 404 to an empty stats object (no activity yet → not an error)', async () => {
    server.use(
      http.get('*/users/me/referrals/stats', () => new HttpResponse(null, { status: 404 })),
    );
    expect(await getReferralStats()).toEqual({});
  });

  it('throws ApiError with status / localized messages on a non-404 failure', async () => {
    server.use(
      http.get('*/users/me/referrals/stats', () =>
        HttpResponse.json(
          { messageEn: 'Server error.', messageAr: 'خطأ في الخادم.', errorCode: 'SERVER_ERROR' },
          { status: 500 },
        ),
      ),
    );
    const err = await getReferralStats().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).errorCode).toBe('SERVER_ERROR');
    expect((err as ApiError).localizedMessage('ar')).toBe('خطأ في الخادم.');
  });
});
