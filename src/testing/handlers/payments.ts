import { http, HttpResponse } from 'msw';

const BASE = 'https://bonyad-app-nyayeditqq-ww.a.run.app/api';

/**
 * HyperPay phase-payment handlers. Defaults model a happy test-mode charge:
 * create-checkout returns a hosted redirectUrl, status reports a test-success
 * code, and pay marks the phase paid. Individual tests override per case via
 * `server.use(...)`.
 */
export const paymentHandlers = [
  http.post(`${BASE}/payments/create-checkout`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { amount?: number };
    return HttpResponse.json({
      success: true,
      checkoutId: 'CHK_TEST_1',
      redirectUrl: 'https://eu-test.oppwa.com/v1/checkouts/CHK_TEST_1',
      environment: 'test',
      amount: body.amount,
    });
  }),
  http.get(`${BASE}/payments/status/:checkoutId`, () =>
    HttpResponse.json({
      success: true,
      paymentResult: true,
      code: '000.100.110',
      transactionId: 'TXN-TEST-1',
      amount: '25000',
      currency: 'SAR',
      paymentBrand: 'VISA',
    }),
  ),
  http.post(`${BASE}/phases/:phaseId/pay`, ({ params }) =>
    HttpResponse.json({
      message: 'Phase paid',
      phaseId: Number(params.phaseId),
      phaseNumber: 1,
      paymentStatus: 'PAID',
      moneySpent: 25000,
      amountPaid: 25000,
      remainingAmount: 0,
      paidAt: '2026-06-18T10:00:00Z',
    }),
  ),
  http.get('*/payments/my-transactions', () =>
    HttpResponse.json({
      content: [
        {
          id: 9001,
          amount: 25000,
          currency: 'SAR',
          status: 'COMPLETED',
          paymentBrand: 'VISA',
          paymentType: 'PHASE',
          projectDescription: 'تشطيب شقة بالرياض',
          phaseNumber: 1,
          completedAt: '2026-06-10T12:30:00Z',
          createdAt: '2026-06-10T12:00:00Z',
          canRequestRefund: true,
          hasRefundRequest: false,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      last: true,
    }),
  ),
  http.get('*/payments/my-refund-requests', () =>
    HttpResponse.json({
      content: [
        {
          id: 5001,
          transactionId: 9001,
          amount: 25000,
          currency: 'SAR',
          reason: 'Service not delivered as agreed',
          status: 'PENDING',
          createdAt: '2026-06-12T09:00:00Z',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      last: true,
    }),
  ),
  http.post('*/payments/transactions/:id/refund-request', async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    return HttpResponse.json(
      {
        id: 5002,
        transactionId: Number(params.id),
        reason: body.reason ?? '',
        status: 'PENDING',
        createdAt: '2026-06-18T10:00:00Z',
      },
      { status: 201 },
    );
  }),
];
