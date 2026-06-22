import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen } from '@/testing/render';

import { JobOffersSection } from './job-offers-section';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const OPEN_PROJECTS = [
  {
    id: 1,
    serviceId: 1,
    serviceNameEn: 'Renovation',
    title: 'Older offer',
    description: 'd1',
    status: 'PENDING',
    assignedTechnicianId: null,
    createdAt: '2026-01-01T00:00:00Z',
    budget: 100000,
    address: 'Riyadh',
    timeRequiredDays: 70,
  },
  {
    id: 2,
    serviceId: 2,
    serviceNameEn: 'Building',
    title: 'Newer offer',
    description: 'd2',
    status: 'BIDDING',
    assignedTechnicianId: null,
    createdAt: '2026-06-01T00:00:00Z',
    budget: 500000,
    address: 'Dammam',
    timeRequiredDays: 140,
  },
];

/** Restrict the technician's services to one of the two open offers. */
function onlyService(id: number) {
  return http.get('*/technician/services/my-services', () =>
    HttpResponse.json({ services: [{ id }] }),
  );
}

describe('JobOffersSection', () => {
  it('renders the heading + tabs and lists available offers on the default tab', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json(OPEN_PROJECTS)));
    renderWithProviders(<JobOffersSection />);

    expect(screen.getByRole('heading', { name: /discover projects/i })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(await screen.findByRole('heading', { name: /older offer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /newer offer/i })).toBeInTheDocument();
  });

  it('links to the projects map', () => {
    server.use(http.get('*/projects', () => HttpResponse.json([])));
    renderWithProviders(<JobOffersSection />);
    expect(screen.getByRole('link', { name: /view on map/i })).toHaveAttribute(
      'href',
      '/dashboard/projects-map',
    );
  });

  it('switches to the Saved tab and shows its empty state', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json(OPEN_PROJECTS)));
    renderWithProviders(<JobOffersSection />);
    await screen.findByRole('heading', { name: /older offer/i });

    fireEvent.click(screen.getByRole('tab', { name: /saved offers/i }));
    expect(screen.getByRole('tab', { name: /saved offers/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText(/no saved offers/i)).toBeInTheDocument();
  });

  it('switches to the Supervision invitations tab and shows the invitation cards', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json(OPEN_PROJECTS)));
    renderWithProviders(<JobOffersSection />);
    await screen.findByRole('heading', { name: /older offer/i });

    fireEvent.click(screen.getByRole('tab', { name: /supervision invitations/i }));
    expect(await screen.findByRole('button', { name: 'Accept' })).toBeInTheDocument();
  });

  it('shows the empty state when no offers are available', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json([])));
    renderWithProviders(<JobOffersSection />);
    expect(await screen.findByText(/no offers available/i)).toBeInTheDocument();
  });

  it("only lists offers matching the technician's own services", async () => {
    server.use(
      http.get('*/projects', () => HttpResponse.json(OPEN_PROJECTS)),
      onlyService(1), // technician offers serviceId 1 → only the "Older offer" qualifies
    );
    renderWithProviders(<JobOffersSection />);

    expect(await screen.findByRole('heading', { name: /older offer/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /newer offer/i })).not.toBeInTheDocument();
  });
});
