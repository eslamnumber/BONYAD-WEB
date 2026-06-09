import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import { type SubmittedOffer } from '../../schemas/submit-offer.schema';

import { EditOfferModal } from './edit-offer-modal';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const offer: SubmittedOffer = {
  id: 123,
  values: { proposedBudget: '250000', durationWeeks: '4', comment: 'My plan.' },
  request: {
    projectId: 42,
    proposedBudget: 250000,
    estimatedDurationDays: 28,
    comment: 'My plan.',
  },
  status: 'PENDING',
};

describe('EditOfferModal', () => {
  it('renders the dialog pre-filled with the current offer', async () => {
    renderWithProviders(
      <EditOfferModal open projectId={42} offer={offer} onClose={vi.fn()} onSaved={vi.fn()} />,
    );

    expect(await screen.findByRole('dialog', { name: 'Edit offer' })).toBeInTheDocument();
    expect((screen.getByLabelText('Offer value') as HTMLInputElement).value).toBe('250000');
    expect((screen.getByLabelText('Delivery time') as HTMLInputElement).value).toBe('4');
    expect((screen.getByLabelText('Offer details') as HTMLTextAreaElement).value).toBe('My plan.');
  });

  it('saves edits via delete-then-create and reports the new offer (weeks → days)', async () => {
    let deleted = '';
    let body: unknown;
    server.use(
      http.delete('*/bids/:id', ({ params }) => {
        deleted = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
      http.post('*/bids/create', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: 7, status: 'PENDING' }, { status: 201 });
      }),
    );
    const onSaved = vi.fn();
    renderWithProviders(
      <EditOfferModal open projectId={42} offer={offer} onClose={vi.fn()} onSaved={onSaved} />,
    );

    fireEvent.change(await screen.findByLabelText('Delivery time'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(body).toBeDefined());
    expect(deleted).toBe('123');
    expect(body).toEqual({
      projectId: 42,
      proposedBudget: 250000,
      estimatedDurationDays: 42,
      comment: 'My plan.',
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 7 })));
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <EditOfferModal open projectId={42} offer={offer} onClose={onClose} onSaved={vi.fn()} />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
