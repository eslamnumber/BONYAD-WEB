import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSubscriptionPlans } from './get-subscription-plans';

describe('getSubscriptionPlans', () => {
  it('returns the plan list from GET /subscriptions/categories', async () => {
    server.use(
      http.get('*/subscriptions/categories', () =>
        HttpResponse.json([{ id: 1, nameEn: 'Free', nameAr: 'مجاني', price: 0, bidsPerWeek: 3 }]),
      ),
    );
    const plans = await getSubscriptionPlans();
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ id: 1, nameEn: 'Free' });
  });

  it('unwraps a Spring page envelope and yields [] on an unexpected shape', async () => {
    server.use(
      http.get('*/subscriptions/categories', () =>
        HttpResponse.json({ content: [{ id: 2, nameEn: 'Pro' }] }),
      ),
    );
    expect(await getSubscriptionPlans()).toHaveLength(1);

    server.use(
      http.get('*/subscriptions/categories', () => HttpResponse.json({ unexpected: true })),
    );
    expect(await getSubscriptionPlans()).toEqual([]);
  });

  it('throws ApiError on a 4xx', async () => {
    server.use(
      http.get('*/subscriptions/categories', () =>
        HttpResponse.json(
          { messageEn: 'Forbidden', messageAr: 'ممنوع', errorCode: 'FORBIDDEN' },
          { status: 403 },
        ),
      ),
    );
    const err = await getSubscriptionPlans().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
    expect((err as ApiError).errorCode).toBe('FORBIDDEN');
  });
});
