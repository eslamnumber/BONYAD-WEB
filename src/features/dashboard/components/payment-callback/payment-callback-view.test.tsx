import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen, waitFor } from '@/testing/render';

import { PaymentCallbackView } from './payment-callback-view';

afterEach(() => {
  window.history.pushState({}, '', '/payment/callback');
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
});

describe('PaymentCallbackView', () => {
  it('verifies the charge, marks the phase paid, and shows the success card', async () => {
    let paidPhaseId = '';
    server.use(
      http.get('*/payments/status/:checkoutId', () =>
        HttpResponse.json({
          paymentResult: true,
          code: '000.100.110',
          transactionId: 'TXN-TEST-1',
          amount: '25000',
          currency: 'SAR',
          paymentBrand: 'VISA',
        }),
      ),
      http.post('*/phases/:phaseId/pay', ({ params }) => {
        paidPhaseId = String(params.phaseId);
        return HttpResponse.json({ phaseId: Number(params.phaseId), paymentStatus: 'PAID' });
      }),
    );
    window.history.pushState(
      {},
      '',
      '/payment/callback?type=phase&phaseId=12&paymentType=FULL&amount=25000&id=CHK_1',
    );

    renderWithProviders(<PaymentCallbackView />);

    expect(await screen.findByText('Payment successful')).toBeInTheDocument();
    expect(screen.getByText('TXN-TEST-1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View my projects' })).toHaveAttribute(
      'href',
      '/dashboard/projects',
    );
    expect(paidPhaseId).toBe('12');
  });

  it('shows the failed state when the charge cannot be verified', async () => {
    server.use(
      http.get('*/payments/status/:checkoutId', () => HttpResponse.json({ code: '800.100.150' })),
    );
    window.history.pushState({}, '', '/payment/callback?type=phase&phaseId=12&id=CHK_FAIL');

    renderWithProviders(<PaymentCallbackView />);

    expect(await screen.findByText('Payment failed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
      'href',
      '/dashboard/projects',
    );
  });

  it('fails fast when no checkout id is present in the callback', async () => {
    window.history.pushState({}, '', '/payment/callback?type=phase');
    renderWithProviders(<PaymentCallbackView />);
    await waitFor(() => expect(screen.getByText('Payment failed')).toBeInTheDocument());
  });
});
