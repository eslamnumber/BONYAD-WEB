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
  shopperResultUrl: 'https://app.test/payment/callback?type=phase&phaseId=12',
};

describe('createCheckout', () => {
  it('POSTs the validated body and normalises checkoutId + redirectUrl', async () => {
    let sentBody: Record<string, unknown> = {};
    server.use(
      http.post('*/payments/create-checkout', async ({ request }) => {
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          checkoutId: 'CHK_1',
          redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CHK_1',
          environment: 'test',
        });
      }),
    );

    const session = await createCheckout(REQ);
    expect(session).toEqual({
      checkoutId: 'CHK_1',
      redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CHK_1',
      environment: 'test',
      isMimic: false,
    });
    expect(sentBody.phaseId).toBe(12);
    expect(sentBody.amount).toBe(25000);
    expect(sentBody.merchantTransactionId).toBe('PHASE-12-FULL-1700000000000');
  });

  it('falls back to id / ndc / shopperUrl when checkoutId / redirectUrl are absent', async () => {
    server.use(
      http.post('*/payments/create-checkout', () =>
        HttpResponse.json({
          result: { code: '000.200.100' },
          ndc: 'NDC_9',
          shopperUrl: 'https://pay/9',
        }),
      ),
    );
    const session = await createCheckout(REQ);
    expect(session.checkoutId).toBe('NDC_9');
    expect(session.redirectUrl).toBe('https://pay/9');
  });

  it('flags mimic mode when the checkoutId is MIMIC_…', async () => {
    server.use(
      http.post('*/payments/create-checkout', () =>
        HttpResponse.json({ success: true, checkoutId: 'MIMIC_42', environment: 'mimic' }),
      ),
    );
    const session = await createCheckout(REQ);
    expect(session.isMimic).toBe(true);
    expect(session.redirectUrl).toBeNull();
  });

  it('throws on a HyperPay error forwarded over HTTP 200 (result.code not 000.)', async () => {
    server.use(
      http.post('*/payments/create-checkout', () =>
        HttpResponse.json({
          result: { code: '800.100.150', description: 'Rejected by bank' },
          ndc: 'X',
        }),
      ),
    );
    await expect(createCheckout(REQ)).rejects.toThrow('Rejected by bank');
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
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('CONFLICT');
    expect((err as ApiError).localizedMessage('ar')).toBe('تم دفع المرحلة.');
  });

  it('rejects an invalid request body before any network call (zod)', async () => {
    await expect(createCheckout({ ...REQ, amount: -5 })).rejects.toBeTruthy();
  });
});
