import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { Subscription } from '../schemas/subscription';

import { getSubscription, isActiveSubscription } from './get-subscription';

/** Mirrors a hydrated GET /users/subscription body (iOS BackendSubscription). */
const ACTIVE: Subscription = {
  userId: 444,
  hasActiveSubscription: true,
  subscriptionCategory: {
    id: 3,
    nameEn: 'Growth',
    nameAr: 'النمو',
    price: 299,
    finalPrice: 299,
    durationDays: 30,
    bidsPerWeek: 20,
  },
  startDate: '2026-06-01T00:00:00.000',
  endDate: '2026-07-01T00:00:00.000',
  daysRemaining: 13,
};

describe('getSubscription', () => {
  it('returns the active subscription body as-is', async () => {
    server.use(http.get('*/users/subscription', () => HttpResponse.json(ACTIVE)));
    expect(await getSubscription()).toEqual(ACTIVE);
  });

  it('returns an activating subscription (category not yet hydrated)', async () => {
    const activating: Subscription = { hasActiveSubscription: true, subscriptionCategory: null };
    server.use(http.get('*/users/subscription', () => HttpResponse.json(activating)));
    expect(await getSubscription()).toEqual(activating);
  });

  it('folds a 404 to null (no active subscription → empty state, not an error)', async () => {
    server.use(http.get('*/users/subscription', () => new HttpResponse(null, { status: 404 })));
    expect(await getSubscription()).toBeNull();
  });

  it('folds an explicit hasActiveSubscription:false body to null', async () => {
    server.use(
      http.get('*/users/subscription', () =>
        HttpResponse.json({ hasActiveSubscription: false, subscriptionCategory: null }),
      ),
    );
    expect(await getSubscription()).toBeNull();
  });

  it('throws ApiError with status / localized messages on a non-404 failure', async () => {
    server.use(
      http.get('*/users/subscription', () =>
        HttpResponse.json(
          { messageEn: 'Server error.', messageAr: 'خطأ في الخادم.', errorCode: 'SERVER_ERROR' },
          { status: 500 },
        ),
      ),
    );
    const err = await getSubscription().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).errorCode).toBe('SERVER_ERROR');
    expect((err as ApiError).localizedMessage('ar')).toBe('خطأ في الخادم.');
  });
});

describe('isActiveSubscription', () => {
  it('is inactive for null / undefined', () => {
    expect(isActiveSubscription(null)).toBe(false);
    expect(isActiveSubscription(undefined)).toBe(false);
  });

  it('is active when a category is joined even without the flag', () => {
    expect(isActiveSubscription({ subscriptionCategory: { id: 1 } })).toBe(true);
  });

  it('is inactive when explicitly flagged false (even with a stale category)', () => {
    expect(
      isActiveSubscription({ hasActiveSubscription: false, subscriptionCategory: { id: 1 } }),
    ).toBe(false);
  });

  it('is inactive for an empty body', () => {
    expect(isActiveSubscription({})).toBe(false);
  });
});
