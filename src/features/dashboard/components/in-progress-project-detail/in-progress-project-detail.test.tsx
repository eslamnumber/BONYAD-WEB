import { http, HttpResponse } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { InProgressProjectDetail } from './in-progress-project-detail';

const PROJECT = {
  id: 7,
  status: 'IN_PROGRESS',
  title: 'Riyadh villa',
  userName: 'Ahmed',
  address: 'Riyadh, Saudi Arabia',
  budget: 250000,
  timeRequiredDays: 360,
  expectedStartDate: '2026-08-01',
  offersCount: 7,
};

const PHASES = [
  {
    id: 1,
    phaseNumber: 1,
    description: 'Concrete structure',
    moneySpent: 20000,
    paymentStatus: 'PAID',
    completed: true,
  },
  {
    id: 2,
    phaseNumber: 2,
    description: 'Electrical works',
    moneySpent: 25000,
    paymentStatus: 'REQUESTED_PAYMENT',
    completed: false,
  },
  {
    id: 3,
    phaseNumber: 3,
    description: 'Plumbing',
    moneySpent: 20000,
    paymentStatus: 'PENDING',
    completed: false,
  },
];

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json({ project: PROJECT, phases: PHASES })),
    http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
  );
});

describe('InProgressProjectDetail', () => {
  it('renders header, summary, payments, progress and the phase timeline from the backend', async () => {
    renderWithProviders(<InProgressProjectDetail projectId={7} />);

    expect(await screen.findByRole('heading', { name: 'Riyadh villa' })).toBeInTheDocument();
    expect(screen.getByText('Ahmed')).toBeInTheDocument();

    // Budget summary + derived progress (1 of 3 phases paid → 33%).
    expect(screen.getByText('Project summary')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();

    // Payment pills mapped from paymentStatus.
    expect(screen.getByText('Awaiting approval')).toBeInTheDocument();

    // Phase timeline; the active phase (2) is expanded by default → shows actions.
    expect(screen.getByText('Project phases')).toBeInTheDocument();
    expect(screen.getByText('Concrete structure')).toBeInTheDocument();
    expect(screen.getByText('Request phase approval')).toBeInTheDocument();
  });

  it('surfaces the error state when the project fails to load', async () => {
    server.use(http.get('*/projects/:id', () => HttpResponse.json(null, { status: 500 })));
    renderWithProviders(<InProgressProjectDetail projectId={7} />);
    expect(await screen.findByText(/couldn't load this project/i)).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = renderWithProviders(<InProgressProjectDetail projectId={7} />);
    await screen.findByRole('heading', { name: 'Riyadh villa' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
