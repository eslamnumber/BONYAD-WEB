import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { prepareCard } from './prepare-card';

describe('prepareCard', () => {
  it('normalises checkoutId + redirectUrl from a hosted-page response', async () => {
    server.use(
      http.post('*/user/cards/prepare', () =>
        HttpResponse.json({
          success: true,
          checkoutId: 'CARD_1',
          redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CARD_1',
          environment: 'test',
        }),
      ),
    );
    const session = await prepareCard();
    expect(session).toEqual({
      checkoutId: 'CARD_1',
      redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CARD_1',
      environment: 'test',
      isMimic: false,
    });
  });

  it('falls back to id / shopperUrl when checkoutId / redirectUrl are absent', async () => {
    server.use(
      http.post('*/user/cards/prepare', () =>
        HttpResponse.json({ id: 'CARD_9', shopperUrl: 'https://pay/9' }),
      ),
    );
    const session = await prepareCard();
    expect(session.checkoutId).toBe('CARD_9');
    expect(session.redirectUrl).toBe('https://pay/9');
  });

  it('flags mimic mode and nulls the redirect when the checkoutId is MIMIC_…', async () => {
    server.use(
      http.post('*/user/cards/prepare', () =>
        HttpResponse.json({ success: true, checkoutId: 'MIMIC_5', environment: 'mimic' }),
      ),
    );
    const session = await prepareCard();
    expect(session.isMimic).toBe(true);
    expect(session.redirectUrl).toBeNull();
  });

  it('throws when no checkout id is present in a success body', async () => {
    server.use(http.post('*/user/cards/prepare', () => HttpResponse.json({ success: true })));
    await expect(prepareCard()).rejects.toThrow(/No checkout ID/);
  });

  it('throws when the backend forwards success:false over HTTP 200', async () => {
    server.use(
      http.post('*/user/cards/prepare', () =>
        HttpResponse.json({ success: false, error: 'Gateway down' }),
      ),
    );
    await expect(prepareCard()).rejects.toThrow('Gateway down');
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/user/cards/prepare', () =>
        HttpResponse.json(
          { messageEn: 'Cannot register.', messageAr: 'تعذّر التسجيل.', errorCode: 'CARD' },
          { status: 400 },
        ),
      ),
    );
    const err = await prepareCard().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('CARD');
  });
});
