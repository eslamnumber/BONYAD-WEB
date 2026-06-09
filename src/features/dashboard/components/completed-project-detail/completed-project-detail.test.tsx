import { http, HttpResponse } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { AssignedProjectDetail } from '../assigned-project-detail';

import { CompletedProjectDetail } from './completed-project-detail';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

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
    paymentStatus: 'PAID',
    completed: true,
  },
];

const completed = (status = 'COMPLETED') => ({
  project: {
    id: 42,
    status,
    userName: 'Ahmed',
    serviceNameEn: 'Construction',
    budget: 250000,
    address: 'Riyadh',
    offersCount: 7,
    timeRequiredDays: 360,
    expectedStartDate: '2026-08-01T00:00:00Z',
  },
  phases: PHASES,
});

beforeEach(() => {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json(completed())),
    http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
  );
});

describe('CompletedProjectDetail', () => {
  it('assembles every section for a completed project', async () => {
    renderWithProviders(<CompletedProjectDetail projectId={42} />);

    // Header (5a back-link + 5b header) render once the project query settles.
    expect(await screen.findByText('Ahmed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByText('Construction')).toBeInTheDocument();

    // Section headings (5c–5f) render immediately (phase rows fill in async).
    expect(screen.getByText('Project summary')).toBeInTheDocument();
    expect(screen.getByText('Payment status')).toBeInTheDocument();
    expect(screen.getByText('Project progress')).toBeInTheDocument();
    expect(screen.getByText('Project phases')).toBeInTheDocument();

    // Phase-derived values appear once the phases query settles.
    expect(await screen.findByText('100%')).toBeInTheDocument(); // all phases paid
    expect(screen.getByText('Concrete structure')).toBeInTheDocument();
    expect(screen.getByText('Phase 1')).toBeInTheDocument();
  });

  it('gates a non-completed project with the not-completed message', async () => {
    server.use(http.get('*/projects/:id', () => HttpResponse.json(completed('IN_PROGRESS'))));
    renderWithProviders(<CompletedProjectDetail projectId={42} />);

    expect(await screen.findByText(/isn't completed yet/i)).toBeInTheDocument();
    expect(screen.queryByText('Project progress')).not.toBeInTheDocument();
  });

  it('shows the error state when the project fails to load', async () => {
    server.use(
      http.get('*/projects/:id', () => HttpResponse.json({ messageEn: 'boom' }, { status: 500 })),
    );
    renderWithProviders(<CompletedProjectDetail projectId={42} />);

    expect(await screen.findByText(/couldn't load this project/i)).toBeInTheDocument();
    expect(screen.queryByText('Project summary')).not.toBeInTheDocument();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<CompletedProjectDetail projectId={42} />);
    await screen.findByText('100%'); // wait for the full screen (phases settled)
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('AssignedProjectDetail dispatch → completed', () => {
  it('routes a COMPLETED project to the completed view', async () => {
    renderWithProviders(<AssignedProjectDetail projectId={42} />);

    expect(await screen.findByText('Project progress')).toBeInTheDocument();
    expect(await screen.findByText('100%')).toBeInTheDocument();
  });
});
