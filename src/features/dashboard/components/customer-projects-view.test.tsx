import { http, HttpResponse } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { fireEvent, renderWithProviders, screen, within } from '@/testing/render';

import { CustomerProjectsView } from './customer-projects-view';

// One row per status the Figma table shows (in-progress / contract / pending /
// rejected / completed). The wildcard matches the in-browser proxy path
// (`/api/proxy/projects/my`) the component fetches in jsdom.
const SAMPLE = [
  {
    id: 1,
    title: 'Riyadh villa',
    status: 'IN_PROGRESS',
    budget: 180000,
    createdAt: '2025-09-10T00:00:00Z',
  },
  {
    id: 2,
    title: 'Jeddah studio',
    status: 'CONTRACT_SIGNING',
    budget: 250000,
    createdAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 3,
    title: 'Dammam commercial',
    status: 'PENDING',
    budget: 2700,
    createdAt: '2025-11-03T00:00:00Z',
  },
  {
    id: 4,
    title: 'Khobar flat',
    status: 'REJECTED',
    budget: 300000,
    createdAt: '2025-08-22T00:00:00Z',
  },
  {
    id: 5,
    title: 'Dammam highway',
    status: 'COMPLETED',
    budget: 300000,
    createdAt: '2025-02-09T00:00:00Z',
  },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  server.use(http.get('*/projects/my', () => HttpResponse.json(SAMPLE)));
});

describe('CustomerProjectsView', () => {
  it('fetches /projects/my and renders a row per project + derived KPI counts', async () => {
    renderWithProviders(<CustomerProjectsView />);

    await screen.findByRole('table');
    // 5 data rows + 1 header row.
    expect(screen.getAllByRole('row')).toHaveLength(6);

    // KPI cards derive from the same list: total 5, active 1, completed 1.
    expect(screen.getByText('Total projects')).toBeInTheDocument();
    expect(screen.getByText('Active projects')).toBeInTheDocument();
    expect(screen.getByText('Completed projects')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Every row links to the shared project-detail route (the only row action).
    expect(screen.getAllByRole('link', { name: /details/i })).toHaveLength(5);
  });

  it('narrows the table when a status filter is selected', async () => {
    renderWithProviders(<CustomerProjectsView />);
    await screen.findByRole('table');

    fireEvent.click(screen.getByRole('tab', { name: 'Completed' }));
    // Only the COMPLETED project remains (1 data row + header).
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('opens the price/date sort menu from the filter pill', async () => {
    renderWithProviders(<CustomerProjectsView />);
    await screen.findByRole('table');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Highest price')).toBeInTheDocument();
    expect(within(menu).getByText('Newest first')).toBeInTheDocument();
  });

  it('has no a11y violations once loaded', async () => {
    const { container } = renderWithProviders(<CustomerProjectsView />);
    await screen.findByRole('table');
    expect(await axe(container)).toHaveNoViolations();
  });
});
