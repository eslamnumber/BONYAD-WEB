import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { subscribePlan } from './subscribe-plan';

describe('subscribePlan', () => {
  it('POSTs { subscriptionCategoryId } to /users/subscribe and resolves void', async () => {
    let body: unknown;
    server.use(
      http.post('*/users/subscribe', async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(subscribePlan(7)).resolves.toBeUndefined();
    expect(body).toEqual({ subscriptionCategoryId: 7 });
  });

  it('throws ApiError with localized messages on failure', async () => {
    server.use(
      http.post('*/users/subscribe', () =>
        HttpResponse.json(
          { messageEn: 'Already subscribed', messageAr: 'مشترك بالفعل', errorCode: 'ALREADY' },
          { status: 400 },
        ),
      ),
    );
    const err = await subscribePlan(7).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).localizedMessage('ar')).toBe('مشترك بالفعل');
  });
});
