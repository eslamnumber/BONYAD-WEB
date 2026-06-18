import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { SubscriptionBids } from '../schemas/subscription';

import { getSubscriptionBids } from './get-subscription-bids';

/** Mirrors a GET /users/subscription/bids body (iOS SubscriptionBidsInfo). */
const BIDS: SubscriptionBids = {
  hasActiveSubscription: true,
  subscriptionCategoryId: 3,
  subscriptionCategoryNameEn: 'Growth',
  subscriptionCategoryNameAr: 'النمو',
  weeklyQuota: 20,
  bidsRemaining: 12,
  lastResetAt: '2026-06-15T00:00:00.000',
  nextResetAt: '2026-06-22T00:00:00.000',
  secondsUntilReset: 320_400,
};

describe('getSubscriptionBids', () => {
  it('returns the bid-quota body as-is', async () => {
    server.use(http.get('*/users/subscription/bids', () => HttpResponse.json(BIDS)));
    expect(await getSubscriptionBids()).toEqual(BIDS);
  });

  it('returns the no-quota body for an account without an active plan', async () => {
    const none: SubscriptionBids = { hasActiveSubscription: false };
    server.use(http.get('*/users/subscription/bids', () => HttpResponse.json(none)));
    expect(await getSubscriptionBids()).toEqual(none);
  });

  it('throws ApiError with status / localized messages on failure', async () => {
    server.use(
      http.get('*/users/subscription/bids', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getSubscriptionBids().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
  });
});
