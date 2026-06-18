import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getPaymentStatus } from './get-payment-status';

describe('getPaymentStatus', () => {
  it('appends the checkoutId to the STATUS path and GETs it', async () => {
    let pathname = '';
    let method = '';
    server.use(
      http.get('*/payments/status/:checkoutId', ({ request }) => {
        method = request.method;
        pathname = new URL(request.url).pathname;
        return HttpResponse.json({
          paymentResult: true,
          transactionId: 'TXN_1',
          amount: '25000',
          currency: 'SAR',
        });
      }),
    );
    const res = await getPaymentStatus('CHK_1');
    expect(method).toBe('GET');
    expect(pathname).toMatch(/\/payments\/status\/CHK_1$/);
    expect(res.success).toBe(true);
    expect(res.isPending).toBe(false);
    expect(res.transactionId).toBe('TXN_1');
  });

  it('treats a test-mode success code (000.100.110) as success', async () => {
    server.use(
      http.get('*/payments/status/:checkoutId', () =>
        HttpResponse.json({ code: '000.100.110', ndc: 'NDC_5' }),
      ),
    );
    const res = await getPaymentStatus('CHK_2');
    expect(res.success).toBe(true);
    expect(res.transactionId).toBe('NDC_5'); // falls back to ndc
  });

  it('classifies 000.200.xxx as pending (not success)', async () => {
    server.use(
      http.get('*/payments/status/:checkoutId', () =>
        HttpResponse.json({ code: '000.200.100', description: 'Pending' }),
      ),
    );
    const res = await getPaymentStatus('CHK_3');
    expect(res.success).toBe(false);
    expect(res.isPending).toBe(true);
    expect(res.description).toBe('Pending');
  });

  it('classifies a non-000 code as failed', async () => {
    server.use(
      http.get('*/payments/status/:checkoutId', () => HttpResponse.json({ code: '800.100.150' })),
    );
    const res = await getPaymentStatus('CHK_4');
    expect(res.success).toBe(false);
    expect(res.isPending).toBe(false);
  });

  it('reads fields nested under result when not at the top level', async () => {
    server.use(
      http.get('*/payments/status/:checkoutId', () =>
        HttpResponse.json({ paymentResult: true, result: { paymentBrand: 'MADA', amount: '999' } }),
      ),
    );
    const res = await getPaymentStatus('CHK_5');
    expect(res.paymentBrand).toBe('MADA');
    expect(res.amount).toBe('999');
  });

  it('throws ApiError on 404', async () => {
    server.use(
      http.get('*/payments/status/:checkoutId', () =>
        HttpResponse.json(
          { messageEn: 'Unknown checkout.', errorCode: 'NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );
    const err = await getPaymentStatus('CHK_X').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).errorCode).toBe('NOT_FOUND');
  });
});
