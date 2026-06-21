import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { completeOnboarding } from './complete-onboarding';

describe('completeOnboarding', () => {
  it('PUTs to /onboarding/:userId/complete with the userId in the path', async () => {
    let method: string | undefined;
    let url: string | undefined;
    server.use(
      http.put('*/onboarding/:userId/complete', ({ request }) => {
        method = request.method;
        url = request.url;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await expect(completeOnboarding(42)).resolves.toBeUndefined();
    expect(method).toBe('PUT');
    expect(url).toContain('/onboarding/42/complete');
  });

  it('throws ApiError on failure', async () => {
    server.use(
      http.put('*/onboarding/:userId/complete', () =>
        HttpResponse.json({ messageEn: 'Forbidden', errorCode: 'FORBIDDEN' }, { status: 403 }),
      ),
    );
    const err = await completeOnboarding(42).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
