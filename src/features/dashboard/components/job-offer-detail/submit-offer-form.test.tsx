import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { SubmitOfferForm } from './submit-offer-form';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

describe('SubmitOfferForm', () => {
  it('shows validation errors on empty submit and does not call the API', async () => {
    let called = false;
    server.use(
      http.post('*/bids/create', () => {
        called = true;
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );
    renderWithProviders(<SubmitOfferForm projectId={42} />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit offer' }));

    expect(await screen.findByText('Enter a valid price.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid duration.')).toBeInTheDocument();
    expect(screen.getByText('Write your application message.')).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it('posts the bid with months converted to days and shows success', async () => {
    let body: unknown;
    server.use(
      http.post('*/bids/create', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: 7, status: 'PENDING' }, { status: 201 });
      }),
    );
    renderWithProviders(<SubmitOfferForm projectId={42} />);

    fireEvent.change(screen.getByLabelText('Offer price (SAR)'), { target: { value: '75000' } });
    fireEvent.change(screen.getByLabelText('Implementation duration'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Application message'), {
      target: { value: 'Detailed plan.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit offer' }));

    await waitFor(() => expect(body).toBeDefined());
    expect(body).toEqual({
      projectId: 42,
      proposedBudget: 75000,
      estimatedDurationDays: 360,
      comment: 'Detailed plan.',
    });
    expect(await screen.findByText('Your offer has been submitted.')).toBeInTheDocument();
  });
});
