import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { type CreateCheckoutRequest } from '../schemas/payment';

import { createCheckout } from './create-checkout';

const REQ: CreateCheckoutRequest = {
  phaseId: 12,
  amount: 25000,
  currency: 'SAR',
  paymentType: 'DB',
  paymentBrand: 'MADA',
  merchantTransactionId: 'PHASE-12-FULL-1700000000000',
  customer: { email: 'c@example.com', givenName: 'Sara', surname: 'Al' },
  billing: {
    street1: 'King Fahd Rd',
    city: 'Riyadh',
    state: 'Riyadh',
    country: 'SA',
    postcode: '12345',
  },
  shopperResultUrl: 'https://app.test/dashboard/projects/5?type=phase&phaseId=12',
};

describe('createCheckout', () => {
  it('POSTs the validated body and returns checkoutId + mode for the widget', async () => {
    let sentBody: Record<string, unknown> = {};
    server.use(
      http.post('*/payments/create-checkout', async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          checkoutId: 'CHK_1',
          mode: 'LIVE',
          code: '000.200.100',
        });
      }),
    );

    const session = await createCheckout(REQ);
    expect(session).toEqual({ checkoutId: 'CHK_1', mode: 'LIVE', expiresAt: null });
    expect(sentBody.phaseId).toBe(12);
    expect(sentBody.merchantTransactionId).toBe('PHASE-12-FULL-1700000000000');
  });

  it('returns mode: null when the backend omits it (the env fallback then resolves the host)', async () => {
    server.use(
      http.post('*/payments/create-checkout', () =>
        HttpResponse.json({ success: true, checkoutId: 'CHK_2', code: '000.200.100' }),
      ),
    );
    const session = await createCheckout(REQ);
    expect(session.mode).toBeNull();
    expect(session.checkoutId).toBe('CHK_2');
  });

  it('throws when the backend forwards success:false over HTTP 200', async () => {
    server.use(
      http.post('*/payments/create-checkout', () =>
        HttpResponse.json({ success: false, error: 'Phase must be approved before payment' }),
      ),
    );
    await expect(createCheckout(REQ)).rejects.toThrow('Phase must be approved');
  });

  it('throws when no checkout id is present in a success body', async () => {
    server.use(http.post('*/payments/create-checkout', () => HttpResponse.json({ success: true })));
    await expect(createCheckout(REQ)).rejects.toThrow(/No checkout ID/);
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/payments/create-checkout', () =>
        HttpResponse.json(
          { messageEn: 'Phase already paid.', messageAr: 'تم دفع المرحلة.', errorCode: 'CONFLICT' },
          { status: 400 },
        ),
      ),
    );
    const err = await createCheckout(REQ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('CONFLICT');
    expect((err as ApiError).localizedMessage('ar')).toBe('تم دفع المرحلة.');
  });

  it('rejects an invalid request body before any network call (zod)', async () => {
    await expect(createCheckout({ ...REQ, amount: -5 })).rejects.toBeTruthy();
  });
});
