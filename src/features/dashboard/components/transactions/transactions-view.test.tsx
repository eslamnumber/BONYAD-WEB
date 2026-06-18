import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { TransactionsView } from './transactions-view';

const TXN = {
  id: 9001,
  amount: 25000,
  currency: 'SAR',
  status: 'COMPLETED',
  paymentBrand: 'VISA',
  paymentType: 'PHASE',
  projectDescription: 'Apartment finishing in Riyadh',
  phaseNumber: 1,
  completedAt: '2026-06-10T12:30:00Z',
  canRequestRefund: true,
  hasRefundRequest: false,
};

const page = (content: unknown[]) =>
  HttpResponse.json({
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    last: true,
  });

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('TransactionsView', () => {
  it('renders the header and a transaction from the API', async () => {
    renderWithProviders(<TransactionsView />);

    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(await screen.findByText('Phase payment')).toBeInTheDocument();
    // "Completed" is also a filter pill (a tab) — scope to the badge span.
    expect(screen.getByText('Completed', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('25,000')).toBeInTheDocument();
  });

  it('shows the empty state when the selected status filter returns nothing', async () => {
    server.use(
      http.get('*/payments/my-transactions', ({ request }) => {
        const status = new URL(request.url).searchParams.get('status');
        return page(status === 'PENDING' ? [] : [TXN]);
      }),
    );
    renderWithProviders(<TransactionsView />);

    await screen.findByText('Apartment finishing in Riyadh');
    fireEvent.click(screen.getByRole('tab', { name: 'Pending' }));
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument();
  });

  it('switches to the Refund Requests tab and lists a request', async () => {
    renderWithProviders(<TransactionsView />);

    fireEvent.click(screen.getByRole('tab', { name: 'Refund requests' }));
    expect(await screen.findByText('Service not delivered as agreed')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
  });

  it('opens the refund dialog, gates submit on a 10-char reason, and closes on success', async () => {
    renderWithProviders(<TransactionsView />);

    fireEvent.click(await screen.findByRole('button', { name: 'Request refund' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'Submit request' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Refund reason'), {
      target: { value: 'Service was never delivered' },
    });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('surfaces the error state with a retry when the list fails to load', async () => {
    server.use(
      http.get('*/payments/my-transactions', () => HttpResponse.json({}, { status: 500 })),
    );
    renderWithProviders(<TransactionsView />);

    expect(await screen.findByText("Couldn't load transactions")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
