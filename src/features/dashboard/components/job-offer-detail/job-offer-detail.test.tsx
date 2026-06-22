import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { JobOfferDetail } from './job-offer-detail';

const nav = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  nav.search = '';
  server.use(
    http.get('*/bids/project/:projectId', () => HttpResponse.json([])),
    http.get('*/phases/project/:projectId', () => HttpResponse.json([])),
  );
  // Default to a service provider; the role-gating block overrides per test.
  useAuthStore.setState({ user: { id: 1, role: 'TECHNICIAN' }, isAuthenticated: true });
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

const detailResponse = (status: string) => ({
  project: {
    id: 42,
    status,
    userName: 'Ahmed',
    serviceNameEn: 'Construction',
    description: 'Brief.',
    budget: 80000,
    address: 'Riyadh',
    createdAt: new Date().toISOString(),
  },
  phases: [],
});

/** Minimal AI snapshot — objectives/scope feed the `above` group, deliverables the `below`. */
const AI_SOW = JSON.stringify({
  objectives: { business_objective: 'Deliver a turnkey villa' },
  scope: { in_scope: ['Foundation', 'Finishing'] },
  deliverables: [{ name: 'Construction drawings' }],
});

const aiDetailResponse = (status: string) => {
  const base = detailResponse(status);
  return { ...base, project: { ...base.project, aiGenerated: true, sowJsonSnapshot: AI_SOW } };
};

describe('JobOfferDetail phase gating', () => {
  it.each(['PENDING', 'BIDDING', 'BID_RECEIVED'])(
    'renders the detail in the %s phase',
    async (status) => {
      server.use(http.get('*/projects/:id', () => HttpResponse.json(detailResponse(status))));
      renderWithProviders(<JobOfferDetail projectId={42} />);
      expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
    },
  );

  it('blocks the detail once the project moves past the bid phase (e.g. COMPLETED)', async () => {
    server.use(http.get('*/projects/:id', () => HttpResponse.json(detailResponse('COMPLETED'))));
    renderWithProviders(<JobOfferDetail projectId={42} />);
    expect(await screen.findByText(/no longer open for offers/i)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });
});

describe('JobOfferDetail role gating', () => {
  beforeEach(() => {
    server.use(http.get('*/projects/:id', () => HttpResponse.json(detailResponse('PENDING'))));
  });

  it('shows the owner the awaiting-offers card with Edit + Delete (not the offer form)', async () => {
    useAuthStore.setState({ user: { id: 9, role: 'USER' }, isAuthenticated: true });
    renderWithProviders(<JobOfferDetail projectId={42} />);

    expect(await screen.findByText('No offers yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit project' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete project' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit offer' })).not.toBeInTheDocument();
  });

  it('shows a service provider the submit-offer form (not the owner actions)', async () => {
    renderWithProviders(<JobOfferDetail projectId={42} />);

    expect(await screen.findByRole('button', { name: 'Submit offer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete project' })).not.toBeInTheDocument();
  });

  it('hides the submit-offer form when opened as the project supervisor (?supervisor=1)', async () => {
    nav.search = 'supervisor=1';
    renderWithProviders(<JobOfferDetail projectId={42} />);

    await screen.findByText('Brief.');
    expect(screen.queryByRole('button', { name: 'Submit offer' })).not.toBeInTheDocument();
  });
});

describe('JobOfferDetail AI Scope-of-Work placement', () => {
  /** True when `b` follows `a` in document order. */
  const isBefore = (a: Element, b: Element) =>
    Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

  it('SP: objectives + scope sit in the left (offer) column, deliverables on the right', async () => {
    server.use(http.get('*/projects/:id', () => HttpResponse.json(aiDetailResponse('PENDING'))));
    renderWithProviders(<JobOfferDetail projectId={42} />);

    const objectives = await screen.findByText('Objectives');
    expect(screen.getByText('Scope of work')).toBeInTheDocument();
    expect(screen.getByText('Deliverables')).toBeInTheDocument();

    // The left column renders before the content column, so the `above` group
    // (objectives + scope) precedes the description that opens the right column.
    expect(isBefore(objectives, screen.getByText('Project description'))).toBe(true);
    expect(isBefore(objectives, screen.getByText('Deliverables'))).toBe(true);
  });

  it('customer: the SOW stays in the content column (after the description)', async () => {
    useAuthStore.setState({ user: { id: 9, role: 'USER' }, isAuthenticated: true });
    server.use(http.get('*/projects/:id', () => HttpResponse.json(aiDetailResponse('PENDING'))));
    renderWithProviders(<JobOfferDetail projectId={42} />);

    const description = await screen.findByText('Project description');
    // For the customer the `above` group renders inside the right column, so it
    // follows the description instead of preceding it (the mirror of the SP layout).
    expect(isBefore(description, screen.getByText('Objectives'))).toBe(true);
  });
});
