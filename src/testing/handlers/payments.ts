import { http, HttpResponse } from 'msw';

/**
 * HyperPay handlers. Defaults model a happy test-mode COPYandPAY checkout:
 * create-checkout returns a checkoutId + mode (for the embedded widget); status reports
 * a test-success verdict (`paymentResult`, which also finalizes the phase server-side).
 * Wildcard-prefixed paths so both node fetcher tests (full backend URL) and happy-dom
 * component tests (same-origin proxy) match. Tests override via `server.use(...)`.
 */
export const paymentHandlers = [
  http.post('*/payments/create-checkout', () =>
    HttpResponse.json({
      success: true,
      checkoutId: 'CHK_TEST_1',
      mode: 'TEST',
      code: '000.200.100',
      description: 'successfully created checkout',
      resourcePath: '/v1/checkouts/CHK_TEST_1/payment',
    }),
  ),
  http.get('*/payments/status/:checkoutId', () =>
    HttpResponse.json({
      success: true,
      paymentResult: true,
      code: '000.100.110',
      transactionId: 'TXN-TEST-1',
      amount: 25000,
      currency: 'SAR',
      paymentBrand: 'VISA',
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
  // Technician request-payment — flips the phase to REQUESTED_PAYMENT.
  http.post('*/phases/:phaseId/request-payment', ({ params }) =>
    HttpResponse.json({
      message: 'Payment requested',
      phaseId: Number(params.phaseId),
      phaseNumber: 1,
      paymentStatus: 'REQUESTED_PAYMENT',
      moneySpent: 25000,
      requestedBy: 42,
      requestedByName: 'فني الاختبار',
      requestedAt: '2026-06-18T10:00:00Z',
    }),
  ),
];
