import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { completeCard } from './complete-card';

const NEW_CARD = {
  id: 3,
  paymentBrand: 'VISA',
  cardBin: '411111',
  lastFourDigits: '1111',
  cardHolder: 'Sara A',
  expiryMonth: '01',
  expiryYear: '29',
  isDefault: false,
  isValidated: true,
  createdAt: '2026-06-18T10:00:00Z',
};

describe('completeCard', () => {
  it('POSTs the validated { checkoutId } body and returns the saved card', async () => {
    let sentBody: Record<string, unknown> = {};
    server.use(
      http.post('*/user/cards/complete', async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, card: NEW_CARD });
      }),
    );
    const card = await completeCard({ checkoutId: 'CARD_CHK_1' });
    expect(card?.lastFourDigits).toBe('1111');
    expect(sentBody.checkoutId).toBe('CARD_CHK_1');
  });

  it('returns null when the backend omits the card', async () => {
    server.use(http.post('*/user/cards/complete', () => HttpResponse.json({ success: true })));
    expect(await completeCard({ checkoutId: 'CARD_CHK_1' })).toBeNull();
  });

  it('throws when the backend forwards success:false over HTTP 200', async () => {
    server.use(
      http.post('*/user/cards/complete', () =>
        HttpResponse.json({ success: false, error: 'Charge not captured' }),
      ),
    );
    await expect(completeCard({ checkoutId: 'CARD_CHK_1' })).rejects.toThrow('Charge not captured');
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/user/cards/complete', () =>
        HttpResponse.json(
          { messageEn: 'Expired checkout.', messageAr: 'انتهت الجلسة.', errorCode: 'EXPIRED' },
          { status: 400 },
        ),
      ),
    );
    const err = await completeCard({ checkoutId: 'CARD_CHK_1' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).localizedMessage('en')).toBe('Expired checkout.');
  });

  it('rejects an empty checkoutId before any network call (zod)', async () => {
    await expect(completeCard({ checkoutId: '' })).rejects.toBeTruthy();
  });
});
