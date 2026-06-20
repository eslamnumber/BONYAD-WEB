import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { AssignedProjectDetail } from './assigned-project-detail';

const APPROVED_PROJECT = {
  id: 77,
  title: 'Riyadh villa',
  status: 'APPROVED',
  budget: 250000,
  timeRequiredDays: 84,
  assignedTechnicianId: 9,
  serviceNameEn: 'Construction',
  files: [],
};

function mockBackend(project: typeof APPROVED_PROJECT) {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json({ project, phases: [] })),
    http.get('*/phases/project/:projectId', () => HttpResponse.json([])),
    http.get('*/contracts/project/:projectId', () =>
      HttpResponse.json({ message: 'none' }, { status: 404 }),
    ),
    http.get('*/bids/project/:projectId', () =>
      HttpResponse.json([{ id: 1, status: 'ACCEPTED', technicianId: 9, proposedBudget: 240000 }]),
    ),
    http.get('*/users/:id/profile', () =>
      HttpResponse.json({ id: 9, name: 'Ahmed Al-Qahtani', averageRating: 4.8, email: 't@x.com' }),
    ),
  );
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('AssignedProjectDetail — routing follows the backend status', () => {
  it('opens the customer approved screen (signing-method picker) on an APPROVED project', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend(APPROVED_PROJECT);
    renderWithProviders(<AssignedProjectDetail projectId={77} />);

    // Customer APPROVED → the review-&-approve screen, not the technician's
    // offer-accepted view nor the contract-sent view.
    expect(await screen.findByText('Choose signing method')).toBeInTheDocument();
    expect(screen.queryByText('Your offer was accepted')).not.toBeInTheDocument();
    expect(screen.queryByText('The contract was sent to your email')).not.toBeInTheDocument();
  });

  it('keeps the technician on the approved (offer-accepted) screen', async () => {
    useAuthStore.setState({
      user: { id: 9, role: 'TECHNICIAN', email: 't@x.com' },
      isAuthenticated: true,
    });
    mockBackend(APPROVED_PROJECT);
    renderWithProviders(<AssignedProjectDetail projectId={77} />);

    expect(await screen.findByText('Your offer was accepted')).toBeInTheDocument();
    expect(screen.queryByText('Choose signing method')).not.toBeInTheDocument();
  });

  it('opens the contract-sent screen for a customer on a CONTRACT_SIGNING project', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend({ ...APPROVED_PROJECT, status: 'CONTRACT_SIGNING' });
    renderWithProviders(<AssignedProjectDetail projectId={77} />);

    expect(await screen.findByText('The contract was sent to your email')).toBeInTheDocument();
    expect(screen.queryByText('Choose signing method')).not.toBeInTheDocument();
  });

  it('opens the technician contract view (download, not in-progress) on a CONTRACT_SIGNING project', async () => {
    useAuthStore.setState({
      user: { id: 9, role: 'TECHNICIAN', email: 't@x.com' },
      isAuthenticated: true,
    });
    mockBackend({ ...APPROVED_PROJECT, status: 'CONTRACT_SIGNING' });
    renderWithProviders(<AssignedProjectDetail projectId={77} />);

    // The technician gets the contract screen (view + download), NOT the customer's
    // "contract sent" panel and NOT a premature in-progress fall-through.
    expect(await screen.findByText('Contract ready for signature')).toBeInTheDocument();
    expect(await screen.findByText('Download contract (PDF)')).toBeInTheDocument();
    expect(screen.queryByText('The contract was sent to your email')).not.toBeInTheDocument();
  });

  it('opens the customer in-progress (per-phase payment) screen on an IN_PROGRESS project', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend({ ...APPROVED_PROJECT, status: 'IN_PROGRESS' });
    renderWithProviders(<AssignedProjectDetail projectId={77} />);

    // Customer IN_PROGRESS → the payment screen (provider + payment status), not the
    // approve/sign screens nor the technician's offer-accepted view.
    expect(await screen.findByText('Payment status')).toBeInTheDocument();
    expect(screen.getByText('Selected service provider')).toBeInTheDocument();
    expect(screen.queryByText('Choose signing method')).not.toBeInTheDocument();
    expect(screen.queryByText('Your offer was accepted')).not.toBeInTheDocument();
  });
});
