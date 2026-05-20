import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSubscriptionPlans } from './get-subscription-plans';

const MOCK_PLAN = {
  id: 1,
  nameEn: 'Basic',
  nameAr: 'أساسي',
  price: 299,
  finalPrice: 299,
  bidsPerWeek: 5,
  hasActiveDiscount: false,
  features: ['5 bids per week', 'Basic profile listing'],
};

describe('getSubscriptionPlans', () => {
  it('returns the parsed plans array on success', async () => {
    server.use(http.get('*/subscriptions/categories', () => HttpResponse.json([MOCK_PLAN])));
    const plans = await getSubscriptionPlans();
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ id: 1, nameEn: 'Basic', bidsPerWeek: 5 });
  });

  it('throws ApiError with status/errorCode on 401', async () => {
    server.use(
      http.get('*/subscriptions/categories', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getSubscriptionPlans().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });

  it('returns an empty array when the backend responds with []', async () => {
    server.use(http.get('*/subscriptions/categories', () => HttpResponse.json([])));
    const plans = await getSubscriptionPlans();
    expect(plans).toEqual([]);
  });
});
