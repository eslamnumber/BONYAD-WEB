import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { payPhase } from './pay-phase';

describe('payPhase', () => {
  it('POSTs /phases/:phaseId/pay with the validated body and returns the response', async () => {
    let pathname = '';
    let sentBody: Record<string, unknown> = {};
    server.use(
      http.post('*/phases/:phaseId/pay', async ({ request }) => {
        pathname = new URL(request.url).pathname;
        sentBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'ok',
          phaseId: 12,
          phaseNumber: 1,
          paymentStatus: 'PARTIALLY_PAID',
          moneySpent: 25000,
          amountPaid: 10000,
          remainingAmount: 15000,
          paidAt: '2026-06-18T10:00:00Z',
        });
      }),
    );

    const res = await payPhase(12, {
      paymentType: 'PARTIAL',
      amount: 10000,
      paymentMethod: 'CARD',
      paymentReference: 'TXN_1',
      gatewayTransactionId: 'TXN_1',
    });

    expect(pathname).toMatch(/\/phases\/12\/pay$/);
    expect(sentBody.paymentType).toBe('PARTIAL');
    expect(sentBody.amount).toBe(10000);
    expect(res.paymentStatus).toBe('PARTIALLY_PAID');
    expect(res.remainingAmount).toBe(15000);
  });

  it('sends no body when called without params (plain pay)', async () => {
    let raw = 'unset';
    server.use(
      http.post('*/phases/:phaseId/pay', async ({ request }) => {
        raw = await request.text();
        return HttpResponse.json({
          phaseId: 7,
          paymentStatus: 'PAID',
          paidAt: '2026-06-18T10:00:00Z',
        });
      }),
    );
    const res = await payPhase(7);
    expect(raw).toBe('');
    expect(res.paymentStatus).toBe('PAID');
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/phases/:phaseId/pay', () =>
        HttpResponse.json(
          {
            messageEn: 'Amount exceeds balance.',
            messageAr: 'المبلغ يتجاوز الرصيد.',
            errorCode: 'BAD_AMOUNT',
          },
          { status: 400 },
        ),
      ),
    );
    const err = await payPhase(12, { paymentType: 'PARTIAL', amount: 999999 }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('BAD_AMOUNT');
    expect((err as ApiError).localizedMessage('ar')).toBe('المبلغ يتجاوز الرصيد.');
  });

  it('rejects an invalid amount before any network call (zod)', async () => {
    await expect(payPhase(12, { amount: -1 })).rejects.toBeTruthy();
  });
});
