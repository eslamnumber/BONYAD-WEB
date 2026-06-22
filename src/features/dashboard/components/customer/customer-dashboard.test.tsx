import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

import { CustomerDashboard } from './customer-dashboard';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

const MY_PROJECTS = [
  {
    id: 10,
    status: 'IN_PROGRESS',
    title: 'Villa Aljouri',
    serviceNameEn: 'Build',
    phases: [
      { id: 101, phaseNumber: 1, paymentStatus: 'PAID', moneySpent: 1000 },
      { id: 102, phaseNumber: 2, paymentStatus: 'REQUESTED_PAYMENT', remainingAmount: 500 },
    ],
  },
  { id: 11, status: 'PENDING', title: 'Kitchen reno' },
  { id: 12, status: 'BID_RECEIVED', title: 'Bathroom fit-out' },
];

/** The three feeds the customer dashboard consumes; overridden per test for /projects/my. */
function feeds(myProjects: Record<string, unknown> | unknown[], status = 200) {
  server.use(
    http.get('*/projects/my', () => HttpResponse.json(myProjects, { status })),
    http.get('*/ads/feed', () => HttpResponse.json({ ads: [] })),
    http.get('*/contracts/my', () => HttpResponse.json({ contracts: [] })),
    http.get('*/services', () => HttpResponse.json([])),
  );
}

describe('CustomerDashboard', () => {
  it('renders the greeting, KPI row and tracking sections when the customer has projects', async () => {
    feeds(MY_PROJECTS);
    useAuthStore.setState({
      user: { id: 1, role: 'USER', name: 'Sara Ahmed' },
      isAuthenticated: true,
    });
    renderWithProviders(<CustomerDashboard />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome back, Sara');

    // KPI labels (paragraphs) appear once /projects/my resolves.
    expect(await screen.findByText('Due now')).toBeInTheDocument();
    expect(screen.getByText('Paid so far')).toBeInTheDocument();
    expect(screen.getByText('Open requests')).toBeInTheDocument();

    // Section headings (h2) from the draft.
    expect(screen.getByRole('heading', { name: 'Payments & installments' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My requests' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Active projects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Explore offers' })).toBeInTheDocument();

    // The active project surfaces with a progress bar (unique by aria-label); its title
    // also appears in the payments rows for the same project.
    expect(await screen.findByRole('progressbar', { name: 'Villa Aljouri' })).toBeInTheDocument();
    expect(screen.getAllByText('Villa Aljouri').length).toBeGreaterThan(0);
  });

  it('shows the welcome hero (empty state) when the customer has no projects', async () => {
    feeds([]);
    renderWithProviders(<CustomerDashboard />);

    expect(await screen.findByText(/start creating your first project/i)).toBeInTheDocument();
    // No KPI row in the empty state…
    expect(screen.queryByText('Due now')).not.toBeInTheDocument();
    // …but the discovery feed still renders.
    expect(screen.getByRole('heading', { name: 'Explore offers' })).toBeInTheDocument();
  });

  it('shows the error state with a retry when /projects/my fails', async () => {
    feeds({ message: 'boom' }, 500);
    renderWithProviders(<CustomerDashboard />);

    expect(await screen.findByText(/couldn't load your dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
