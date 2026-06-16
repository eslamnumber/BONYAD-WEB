import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { ContractSigningProjectDetail } from './contract-signing-project-detail';

const PROJECT_ID = 102;

const PROJECT = {
  id: PROJECT_ID,
  title: 'Riyadh villa',
  status: 'CONTRACT_SIGNING',
  budget: 250000,
  timeRequiredDays: 84, // → 12 weeks
  expectedStartDate: '2026-08-01T00:00:00Z',
  address: 'Riyadh, Saudi Arabia',
  assignedTechnicianId: 9,
  serviceNameEn: 'Construction',
  serviceNameAr: 'البناء',
};

const PHASES = [
  {
    id: 1,
    title: 'Phase 1: Foundations',
    description: 'Site prep and clearing.\nExcavation and backfill.\nConcrete foundations.',
    moneySpent: 100000,
    timeSpentDays: 3,
    expectedDate: '2026-09-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Phase 2: Structure',
    description: 'Columns and slabs.\nCuring.',
    moneySpent: 50000,
    timeSpentDays: 30,
    expectedDate: '2026-12-01T00:00:00Z',
  },
];

const CONTRACT = {
  id: 501,
  projectId: PROJECT_ID,
  technicianId: 9,
  status: 'PENDING_SIGNATURE',
  createdAt: '2026-06-16T08:57:00Z',
};

const TECHNICIAN = {
  id: 9,
  name: 'Ahmed Al-Qahtani',
  averageRating: 4.8,
  email: 'tech@example.com',
};

function mockBackend() {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json({ project: PROJECT, phases: PHASES })),
    http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
    http.get('*/contracts/project/:projectId', () => HttpResponse.json(CONTRACT)),
    http.get('*/users/:id/profile', () => HttpResponse.json(TECHNICIAN)),
  );
}

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('ContractSigningProjectDetail', () => {
  it('renders the contract-signing badge, summary, provider, sent panel, phases + progress', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend();
    renderWithProviders(<ContractSigningProjectDetail projectId={PROJECT_ID} />);

    // Summary: contract-signing status badge + title + 12-week duration.
    expect(await screen.findByText('Contract signing')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Riyadh villa' })).toBeInTheDocument();
    expect(screen.getByText('12 weeks')).toBeInTheDocument();

    // Provider card: heading + technician name + rating (from the profile fetch).
    expect(screen.getByText('Selected service provider')).toBeInTheDocument();
    expect(await screen.findByText('Ahmed Al-Qahtani')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();

    // Sent card: title, the customer's email, both actions.
    expect(screen.getByText('The contract was sent to your email')).toBeInTheDocument();
    expect(await screen.findByText('owner@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I have signed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend' })).toBeInTheDocument();

    // Progress card.
    expect(screen.getByText('Project progress')).toBeInTheDocument();

    // Phases card: heading, phase title, amount + duration badges, task bullets.
    expect(screen.getByRole('heading', { name: 'Project phases' })).toBeInTheDocument();
    expect(await screen.findByText('Phase 1: Foundations')).toBeInTheDocument();
    expect(screen.getByText('100,000')).toBeInTheDocument();
    expect(screen.getByText('3 days')).toBeInTheDocument();
    expect(screen.getByText('Site prep and clearing.')).toBeInTheDocument();
  });

  it('enables Resend once the technician profile + customer email are loaded', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend();
    renderWithProviders(<ContractSigningProjectDetail projectId={PROJECT_ID} />);

    const resend = await screen.findByRole('button', { name: 'Resend' });
    // Wait for the technician profile (carries the email needed for /signatures).
    await screen.findByText('Ahmed Al-Qahtani');
    expect(resend).toBeEnabled();
  });

  it('has no a11y violations', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend();
    const { container } = renderWithProviders(
      <ContractSigningProjectDetail projectId={PROJECT_ID} />,
    );
    await screen.findByText('Ahmed Al-Qahtani');
    expect(await axe(container)).toHaveNoViolations();
  });
});
