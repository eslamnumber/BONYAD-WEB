import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithProviders, screen } from '@/testing/render';

import type { Project } from '../schemas/project';

import { ProjectsTable } from './projects-table';

const PROJECTS: Project[] = [
  {
    id: 11,
    title: 'Riyadh villa',
    userName: 'Ahmed',
    projectType: 'Construction',
    budget: 180000,
    status: 'APPROVED',
  },
  {
    id: 12,
    title: 'Jeddah studio',
    userName: 'Sara',
    projectType: 'Interior',
    budget: 250000,
    status: 'OFFER_SENT',
  },
  {
    id: 13,
    title: 'Dammam commercial',
    userName: 'Mohammed',
    projectType: 'Build',
    budget: 2700,
    status: 'IN_PROGRESS',
  },
  {
    id: 14,
    title: 'Khobar flat',
    userName: 'Layla',
    projectType: 'Decor',
    budget: 300000,
    status: 'REJECTED',
  },
  {
    id: 15,
    title: 'Jeddah mall',
    userName: 'Noura',
    projectType: 'Design',
    budget: 850000,
    status: 'PENDING',
  },
  {
    id: 16,
    title: 'Dammam highway',
    userName: 'Mansour',
    projectType: 'Infra',
    budget: 600000,
    status: 'COMPLETED',
  },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('ProjectsTable', () => {
  it('renders a row per project with the localized status badge', () => {
    renderWithProviders(<ProjectsTable projects={PROJECTS} />);
    expect(screen.getAllByRole('row')).toHaveLength(PROJECTS.length + 1); // + header row
    for (const label of [
      'Approved',
      'Offer sent',
      'In progress',
      'Rejected',
      'Pending',
      'Completed',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('formats the budget with thousands separators and links each row to its detail', () => {
    renderWithProviders(<ProjectsTable projects={PROJECTS} />);
    expect(screen.getByText('180,000')).toBeInTheDocument();
    const detailLinks = screen.getAllByRole('link', { name: /details/i });
    expect(detailLinks).toHaveLength(PROJECTS.length);
    // APPROVED (id 11) is an assigned project → shared detail route (dispatched by status).
    expect(detailLinks[0]).toHaveAttribute('href', '/dashboard/projects/11');
    // IN_PROGRESS (id 13) → same assigned-project detail route.
    expect(detailLinks[2]).toHaveAttribute('href', '/dashboard/projects/13');
    // PENDING (id 15) is still in the bid phase → offer-submission screen.
    expect(detailLinks[4]).toHaveAttribute('href', '/dashboard/job-offers/15');
    // COMPLETED (id 16) → assigned-project detail route.
    expect(detailLinks[5]).toHaveAttribute('href', '/dashboard/projects/16');
  });

  it('links the contract-signing row to its detail for the customer', () => {
    renderWithProviders(
      <ProjectsTable projects={[{ id: 185, title: 'Riyadh build', status: 'CONTRACT_SIGNING' }]} />,
    );
    expect(screen.getByText('Contract signing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /details/i })).toHaveAttribute(
      'href',
      '/dashboard/projects/185',
    );
  });

  it('keeps the contract-signing row card-only for a technician (no detail screen)', () => {
    useAuthStore.setState({ user: { id: 1, role: 'TECHNICIAN' }, isAuthenticated: true });
    renderWithProviders(
      <ProjectsTable projects={[{ id: 185, title: 'Riyadh build', status: 'CONTRACT_SIGNING' }]} />,
    );
    expect(screen.getByText('Contract signing')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /details/i })).not.toBeInTheDocument();
  });

  it('has column headers and no a11y violations', async () => {
    const { container } = renderWithProviders(<ProjectsTable projects={PROJECTS} />);
    expect(screen.getByRole('columnheader', { name: /project/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /client/i })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
