import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { requestPhasePayment } from './request-phase-payment';

describe('requestPhasePayment', () => {
  it('POSTs to /phases/:id/request-payment with no body and returns the parsed response', async () => {
    let method = '';
    let pathname = '';
    let rawBody = 'unset';
    server.use(
      http.post('*/phases/:phaseId/request-payment', async ({ request, params }) => {
        method = request.method;
        pathname = new URL(request.url).pathname;
        rawBody = await request.text();
        return HttpResponse.json({
          message: 'Payment requested',
          phaseId: Number(params.phaseId),
          phaseNumber: 2,
          paymentStatus: 'REQUESTED_PAYMENT',
          moneySpent: 5000,
          requestedBy: 9,
          requestedByName: 'Tech',
        });
      }),
    );

    const res = await requestPhasePayment(77);
    expect(method).toBe('POST');
    expect(pathname).toMatch(/\/phases\/77\/request-payment$/);
    expect(rawBody).toBe(''); // no body sent (RN parity)
    expect(res.paymentStatus).toBe('REQUESTED_PAYMENT');
    expect(res.phaseId).toBe(77);
  });

  it('surfaces a 400 (phase not approved) as ApiError with localized messages', async () => {
    server.use(
      http.post('*/phases/:phaseId/request-payment', () =>
        HttpResponse.json(
          {
            messageEn: 'Phase not approved.',
            messageAr: 'لم تتم الموافقة على المرحلة.',
            errorCode: 'PHASE_NOT_APPROVED',
          },
          { status: 400 },
        ),
      ),
    );
    const err = await requestPhasePayment(5).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).errorCode).toBe('PHASE_NOT_APPROVED');
    expect((err as ApiError).localizedMessage('ar')).toBe('لم تتم الموافقة على المرحلة.');
  });
});
