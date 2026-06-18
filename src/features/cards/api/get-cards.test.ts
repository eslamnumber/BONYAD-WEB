import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getCards } from './get-cards';

const CARD = {
  id: 7,
  paymentBrand: 'MADA',
  cardBin: '588845',
  lastFourDigits: '0008',
  cardHolder: 'Ali Q',
  expiryMonth: '11',
  expiryYear: '28',
  isDefault: false,
  isValidated: true,
  createdAt: '2026-05-02T09:00:00Z',
};

describe('getCards', () => {
  it('returns the cards array from the { success, cards } envelope', async () => {
    server.use(http.get('*/user/cards', () => HttpResponse.json({ success: true, cards: [CARD] })));
    const cards = await getCards();
    expect(cards).toHaveLength(1);
    expect(cards[0]?.lastFourDigits).toBe('0008');
  });

  it('tolerates a bare array response', async () => {
    server.use(http.get('*/user/cards', () => HttpResponse.json([CARD])));
    const cards = await getCards();
    expect(cards[0]?.paymentBrand).toBe('MADA');
  });

  it('defaults to an empty list when cards is absent', async () => {
    server.use(http.get('*/user/cards', () => HttpResponse.json({ success: true })));
    expect(await getCards()).toEqual([]);
  });

  it('throws when the backend forwards success:false over HTTP 200', async () => {
    server.use(
      http.get('*/user/cards', () => HttpResponse.json({ success: false, error: 'No wallet' })),
    );
    await expect(getCards()).rejects.toThrow('No wallet');
  });

  it('throws ApiError with localized messages on 401', async () => {
    server.use(
      http.get('*/user/cards', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'AUTH' },
          { status: 401 },
        ),
      ),
    );
    const err = await getCards().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});
