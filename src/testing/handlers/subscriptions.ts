import { http, HttpResponse } from 'msw';

/**
 * Default subscription handlers — an active "Growth" plan with a partly-used weekly
 * bid quota, plus a cancel endpoint. Wildcard-prefixed paths match both the
 * absolute backend host and the same-origin proxy URL the browser uses in jsdom
 * tests. Per-test overrides (server.use) cover the 404/empty, error, and
 * non-active branches.
 */
export const subscriptionHandlers = [
  http.get('*/users/subscription', () =>
    HttpResponse.json({
      userId: 1,
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
    }),
  ),
  http.get('*/users/subscription/bids', () =>
    HttpResponse.json({
      hasActiveSubscription: true,
      subscriptionCategoryId: 3,
      subscriptionCategoryNameEn: 'Growth',
      subscriptionCategoryNameAr: 'النمو',
      weeklyQuota: 20,
      bidsRemaining: 12,
      lastResetAt: '2026-06-15T00:00:00.000',
      nextResetAt: '2026-06-22T00:00:00.000',
      secondsUntilReset: 320_400,
    }),
  ),
  http.delete('*/users/subscription', () => new HttpResponse(null, { status: 204 })),
];
