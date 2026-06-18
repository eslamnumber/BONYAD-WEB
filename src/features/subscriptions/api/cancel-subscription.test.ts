import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { cancelSubscription } from './cancel-subscription';

describe('cancelSubscription', () => {
  it('issues a DELETE to /users/subscription and resolves on an empty 204', async () => {
    let method: string | undefined;
    server.use(
      http.delete('*/users/subscription', ({ request }) => {
        method = request.method;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(cancelSubscription()).resolves.toBeUndefined();
    expect(method).toBe('DELETE');
  });

  it('throws ApiError with status / localized messages on failure', async () => {
    server.use(
      http.delete('*/users/subscription', () =>
        HttpResponse.json(
          {
            messageEn: 'No active subscription to cancel.',
            messageAr: 'لا يوجد اشتراك فعّال لإلغائه.',
            errorCode: 'NO_SUBSCRIPTION',
          },
          { status: 400 },
        ),
      ),
    );
    const err = await cancelSubscription().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('NO_SUBSCRIPTION');
    expect((err as ApiError).localizedMessage('ar')).toBe('لا يوجد اشتراك فعّال لإلغائه.');
  });
});
