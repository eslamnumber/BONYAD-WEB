import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor, within } from '@/testing/render';

import { CustomerApprovedDetail } from './customer-approved-detail';

const PROJECT = {
  id: 77,
  title: 'Riyadh villa',
  status: 'APPROVED',
  budget: 250000,
  timeRequiredDays: 84,
  assignedTechnicianId: 9,
  serviceNameEn: 'Construction',
  files: [],
};

const PHASES = [
  { id: 1, title: 'Phase 1: Foundations', timeSpentDays: 3, moneySpent: 100000 },
  { id: 2, title: 'Phase 2: Concrete frame', timeSpentDays: 5, moneySpent: 50000 },
];

function mockBackend(onApproveAll?: () => void, onSignature?: () => void) {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json({ project: PROJECT, phases: PHASES })),
    http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
    http.get('*/contracts/project/:projectId', () =>
      HttpResponse.json({ message: 'none' }, { status: 404 }),
    ),
    http.get('*/bids/project/:projectId', () =>
      HttpResponse.json([{ id: 1, status: 'ACCEPTED', technicianId: 9, proposedBudget: 240000 }]),
    ),
    http.get('*/users/:id/profile', () =>
      HttpResponse.json({ id: 9, name: 'Ahmed Al-Qahtani', averageRating: 4.8, email: 't@x.com' }),
    ),
    http.post('*/phases/project/:projectId/approve-all', () => {
      onApproveAll?.();
      return HttpResponse.json({ projectStatus: 'CONTRACT_SIGNING' });
    }),
    http.post('*/signatures', () => {
      onSignature?.();
      return HttpResponse.json({ ok: true });
    }),
  );
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('CustomerApprovedDetail', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
  });

  it('renders the three signing methods and the action CTAs', async () => {
    mockBackend();
    renderWithProviders(<CustomerApprovedDetail projectId={77} />);

    expect(await screen.findByText('Choose signing method')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Email/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Nafath/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Absher/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request modification' })).toBeInTheDocument();
  });

  it('selects an alternative method on click', async () => {
    mockBackend();
    renderWithProviders(<CustomerApprovedDetail projectId={77} />);

    const nafath = await screen.findByRole('radio', { name: /Nafath/ });
    fireEvent.click(nafath);
    expect(nafath).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Email/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('opens the review-phases modal and approves all phases', async () => {
    let approveAllHit = false;
    let signatureHit = false;
    mockBackend(
      () => {
        approveAllHit = true;
      },
      () => {
        signatureHit = true;
      },
    );
    renderWithProviders(<CustomerApprovedDetail projectId={77} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Approve phases' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Project phases')).toBeInTheDocument();
    expect(within(dialog).getByText('Phase 1: Foundations')).toBeInTheDocument();
    expect(within(dialog).getByText('Total')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Approve phases' }));

    await waitFor(() => expect(approveAllHit).toBe(true));
    await waitFor(() => expect(signatureHit).toBe(true));
  });
});
