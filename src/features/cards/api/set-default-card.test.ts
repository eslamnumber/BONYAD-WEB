import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { setDefaultCard } from './set-default-card';

describe('setDefaultCard', () => {
  it('PUTs to /user/cards/:id/default and resolves on success', async () => {
    let hitUrl = '';
    server.use(
      http.put('*/user/cards/:id/default', ({ request }) => {
        hitUrl = request.url;
        return HttpResponse.json({ success: true, card: { id: 5, isDefault: true } });
      }),
    );
    await expect(setDefaultCard(5)).resolves.toBeUndefined();
    expect(hitUrl).toContain('/user/cards/5/default');
  });

  it('throws when the backend forwards success:false over HTTP 200', async () => {
    server.use(
      http.put('*/user/cards/:id/default', () =>
        HttpResponse.json({ success: false, error: 'Card not validated' }),
      ),
    );
    await expect(setDefaultCard(5)).rejects.toThrow('Card not validated');
  });

  it('throws ApiError with localized messages on 404', async () => {
    server.use(
      http.put('*/user/cards/:id/default', () =>
        HttpResponse.json(
          {
            messageEn: 'Card not found.',
            messageAr: 'البطاقة غير موجودة.',
            errorCode: 'NOT_FOUND',
          },
          { status: 404 },
        ),
      ),
    );
    const err = await setDefaultCard(99).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).localizedMessage('ar')).toBe('البطاقة غير موجودة.');
  });
});
