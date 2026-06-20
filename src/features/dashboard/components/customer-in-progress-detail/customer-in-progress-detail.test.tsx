import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { CustomerInProgressDetail } from './customer-in-progress-detail';

const PROJECT = {
  id: 5,
  title: 'Villa',
  status: 'IN_PROGRESS',
  budget: 100000,
  assignedTechnicianId: 9,
  files: [],
};

const PHASES = [
  {
    id: 1,
    phaseNumber: 1,
    title: 'Foundations',
    description: 'Footings',
    completed: false,
    paymentStatus: 'PENDING',
    moneySpent: 25000,
    remainingAmount: 25000,
  },
  {
    id: 2,
    phaseNumber: 2,
    title: 'Structure',
    completed: false,
    paymentStatus: 'PENDING',
    moneySpent: 50000,
    remainingAmount: 50000,
  },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

function mockBackend() {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json({ project: PROJECT, phases: PHASES })),
    http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
    http.get('*/users/:id/profile', () =>
      HttpResponse.json({ id: 9, name: 'Ahmed Al-Qahtani', averageRating: 4.8 }),
    ),
  );
}

describe('CustomerInProgressDetail — Approve opens the payment flow', () => {
  it('shows Approve on the active phase and opens the choose-payment modal', async () => {
    mockBackend();
    renderWithProviders(<CustomerInProgressDetail projectId={5} />);

    // The active (first not-completed) phase is expanded by default → Approve shows.
    const approve = await screen.findByRole('button', { name: 'Approve' });
    fireEvent.click(approve);

    expect(await screen.findByText('How would you like to pay?')).toBeInTheDocument();
  });

  it('expands a collapsed phase when its summary row is clicked', async () => {
    mockBackend();
    renderWithProviders(<CustomerInProgressDetail projectId={5} />);

    // Phase 2 is not the active phase → collapsed by default (single-open accordion).
    const phase2Header = await screen.findByRole('button', { name: /Structure/ });
    expect(phase2Header).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(phase2Header);
    expect(phase2Header).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('CustomerInProgressDetail — payment return shows the result modal in place', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/dashboard/projects/5');
    try {
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it('pops the success modal here (no "View my projects" button) after a verified charge', async () => {
    mockBackend();
    server.use(
      http.get('*/payments/status/:checkoutId', () =>
        HttpResponse.json({
          paymentResult: true,
          code: '000.100.110',
          transactionId: 'TXN-IP-1',
          amount: '25000',
          currency: 'SAR',
          paymentBrand: 'MADA',
        }),
      ),
      http.post('*/phases/:phaseId/pay', ({ params }) =>
        HttpResponse.json({ phaseId: Number(params.phaseId), paymentStatus: 'PAID' }),
      ),
    );
    window.history.pushState(
      {},
      '',
      '/dashboard/projects/5?type=phase&phaseId=1&paymentType=FULL&amount=25000&id=CHK_IP',
    );

    renderWithProviders(<CustomerInProgressDetail projectId={5} />);

    expect(await screen.findByText('Payment successful')).toBeInTheDocument();
    expect(screen.getByText('TXN-IP-1')).toBeInTheDocument();
    // The footer CTA is dropped in modal mode — the customer is already on the project.
    expect(screen.queryByRole('link', { name: 'View my projects' })).not.toBeInTheDocument();
  });
});
