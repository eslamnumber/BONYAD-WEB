import { http, HttpResponse } from 'msw';

/** A fully-validated default card the list returns by default. */
const SAMPLE_CARD = {
  id: 1,
  paymentBrand: 'VISA',
  cardBin: '424242',
  lastFourDigits: '4242',
  cardHolder: 'Sara Ahmed',
  expiryMonth: '08',
  expiryYear: '27',
  isDefault: true,
  isValidated: true,
  createdAt: '2026-05-01T10:00:00Z',
};

/**
 * Saved-card handlers (the `/user/cards` group). Defaults model a happy path: one registered
 * card, a prepare that opens a hosted checkout, a complete that returns a new card,
 * and 200-OK set-default / delete. Individual tests override per case via
 * `server.use(...)`.
 */
export const cardHandlers = [
  http.get('*/user/cards', () => HttpResponse.json({ success: true, cards: [SAMPLE_CARD] })),
  http.post('*/user/cards/prepare', () =>
    HttpResponse.json({
      success: true,
      checkoutId: 'CARD_CHK_1',
      redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CARD_CHK_1',
    }),
  ),
  http.post('*/user/cards/complete', () =>
    HttpResponse.json({
      success: true,
      card: { ...SAMPLE_CARD, id: 2, lastFourDigits: '1111', isDefault: false },
    }),
  ),
  http.put('*/user/cards/:id/default', () => HttpResponse.json({ success: true })),
  http.delete('*/user/cards/:id', () => HttpResponse.json({ success: true })),
];
