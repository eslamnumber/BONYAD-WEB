import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { AssignedProjectDetail } from '../assigned-project-detail';

import { ApprovedProjectDetail } from './approved-project-detail';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  server.use(
    http.get('*/bids/project/:projectId', () =>
      HttpResponse.json([
        {
          id: 2,
          status: 'ACCEPTED',
          proposedBudget: 180000,
          estimatedDurationDays: 30,
          createdAt: '2026-06-05T12:00:00Z',
        },
      ]),
    ),
    http.get('*/phases/project/:projectId', () => HttpResponse.json([])),
  );
});

const detail = (status: string) => ({
  project: {
    id: 42,
    status,
    userName: 'Ahmed',
    serviceNameEn: 'Construction',
    description: 'Build a villa.',
    budget: 250000,
    address: 'Riyadh',
    requirements: ['Concrete'],
    createdAt: new Date().toISOString(),
  },
  phases: [],
});

describe('ApprovedProjectDetail', () => {
  it.each(['APPROVED', 'PHASE_PLANNING'])(
    'assembles the approved screen for the %s phase',
    async (status) => {
      server.use(http.get('*/projects/:id', () => HttpResponse.json(detail(status))));
      renderWithProviders(<ApprovedProjectDetail projectId={42} />);
      expect(await screen.findByText('Ahmed')).toBeInTheDocument(); // summary client
      // offer value comes from the bids query (separate async) — await it
      expect(await screen.findByText('180,000')).toBeInTheDocument(); // offer card (accepted bid)
      expect(screen.getByText('Your offer was accepted')).toBeInTheDocument();
      expect(screen.getByText('Project description')).toBeInTheDocument(); // reused card
      expect(screen.getByText('Attachments')).toBeInTheDocument(); // reused card
      expect(screen.getByRole('link', { name: 'Back' })).toBeInTheDocument();
    },
  );

  it('shows the error state when the project fails to load', async () => {
    server.use(
      http.get('*/projects/:id', () => HttpResponse.json({ messageEn: 'boom' }, { status: 500 })),
    );
    renderWithProviders(<ApprovedProjectDetail projectId={42} />);
    expect(await screen.findByText(/couldn't load this project/i)).toBeInTheDocument();
    expect(screen.queryByText('Your offer was accepted')).not.toBeInTheDocument();
  });
});

describe('AssignedProjectDetail dispatch', () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  // The approved/offer-accepted view is the TECHNICIAN's screen; the customer's
  // approved-stage routing to the contract screen is covered in
  // assigned-project-detail.test.tsx.
  it.each(['APPROVED', 'PHASE_PLANNING'])(
    'routes the technician %s phase to the offer-accepted (approved) view',
    async (status) => {
      useAuthStore.setState({ user: { id: 9, role: 'TECHNICIAN' }, isAuthenticated: true });
      server.use(http.get('*/projects/:id', () => HttpResponse.json(detail(status))));
      renderWithProviders(<AssignedProjectDetail projectId={42} />);
      expect(await screen.findByText('Your offer was accepted')).toBeInTheDocument();
    },
  );
});
