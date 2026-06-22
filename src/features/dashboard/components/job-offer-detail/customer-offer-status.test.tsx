import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/testing/render';

import type { Project } from '../../schemas/project';

import { CustomerOfferStatus } from './customer-offer-status';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

const BIDS = [
  {
    id: 1,
    projectId: 42,
    technicianId: 7,
    technicianName: 'سعد الحربي',
    proposedBudget: 16000,
    estimatedDurationDays: 28,
    comment: 'عرض ممتاز',
    status: 'PENDING',
    createdAt: '2026-06-15T00:00:00Z',
  },
  {
    id: 2,
    projectId: 42,
    technicianId: 8,
    technicianName: 'خالد',
    proposedBudget: 30000,
    estimatedDurationDays: 40,
    comment: 'عرض ثانٍ',
    status: 'PENDING',
    createdAt: '2026-06-14T00:00:00Z',
  },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  useAuthStore.setState({ user: { id: 9, role: 'USER' }, isAuthenticated: true });
  server.use(
    http.get('*/users/:id/profile', ({ params }) =>
      HttpResponse.json({ id: Number(params.id), averageRating: 4.9, totalReviews: 12 }),
    ),
  );
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('CustomerOfferStatus', () => {
  it('shows the awaiting card when there are no bids', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([])));
    renderWithProviders(<CustomerOfferStatus projectId={42} />);
    expect(await screen.findByText('No offers yet')).toBeInTheDocument();
  });

  it('renders the success-metrics (مؤشرات النجاح) card before the Edit project button when no bids', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([])));
    const project = {
      aiGenerated: true,
      sowKpis: JSON.stringify([{ metric: 'On-time delivery', target: '95%' }]),
    } as unknown as Project;
    renderWithProviders(<CustomerOfferStatus project={project} projectId={42} />);

    const kpis = await screen.findByText('Success metrics');
    const editButton = screen.getByRole('button', { name: 'Edit project' });
    // The KPIs card precedes the Edit/Delete actions in the DOM (rendered above them).
    expect(
      kpis.compareDocumentPosition(editButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('lists bid cards, flags the lowest as best value, and enriches from the profile', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json(BIDS)));
    renderWithProviders(<CustomerOfferStatus projectId={42} />);

    expect(await screen.findByText('سعد الحربي')).toBeInTheDocument();
    // The 16,000 bid is the lowest → exactly one "Best value" pill.
    expect(screen.getAllByText('Best value')).toHaveLength(1);
    // Profile enrichment — rating + "N completed projects" on each card.
    expect((await screen.findAllByText('4.9')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed projects/i).length).toBeGreaterThan(0);
  });

  it('opens the accept modal (message shown) and accepts via POST /bids/:id/accept', async () => {
    let acceptedId = '';
    server.use(
      http.get('*/bids/project/:projectId', () => HttpResponse.json(BIDS)),
      http.post('*/bids/:id/accept', ({ params }) => {
        acceptedId = String(params.id);
        return HttpResponse.json({ status: 'ACCEPTED' });
      }),
    );
    renderWithProviders(<CustomerOfferStatus projectId={42} />);

    const acceptButtons = await screen.findAllByRole('button', { name: 'Accept' });
    fireEvent.click(acceptButtons[0] as HTMLElement);

    expect(await screen.findByRole('button', { name: 'Accept offer' })).toBeInTheDocument();
    expect(screen.getByText('Offer message')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Accept offer' }));
    await waitFor(() => expect(acceptedId).toBe('1'));
  });
});
