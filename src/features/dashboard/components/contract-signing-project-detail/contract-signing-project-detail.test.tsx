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
  userId: 100, // the project owner / client
  userName: 'Owner Saleh',
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

const CLIENT = {
  id: 100,
  name: 'Owner Saleh',
  email: 'owner@example.com',
};

/** GET /users/:id/profile — the card fetches whichever peer it points at, so the
 *  handler answers per id (technician 9 for the customer's card, client 100 for the
 *  technician's). */
const profileHandler = http.get('*/users/:id/profile', ({ params }) =>
  HttpResponse.json(String(params.id) === '100' ? CLIENT : TECHNICIAN),
);

function mockBackend() {
  server.use(
    http.get('*/projects/:id', () => HttpResponse.json({ project: PROJECT, phases: PHASES })),
    http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
    http.get('*/contracts/project/:projectId', () => HttpResponse.json(CONTRACT)),
    profileHandler,
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
    // The customer messages the technician (the selected provider).
    expect(screen.getByRole('link', { name: 'Message the service provider' })).toHaveAttribute(
      'href',
      expect.stringContaining('user=9'),
    );

    // Sent card: title, the customer's email, both actions.
    expect(screen.getByText('The contract was sent to your email')).toBeInTheDocument();
    expect(await screen.findByText('owner@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I have signed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend' })).toBeInTheDocument();
    // Download pre-generates the PDF, so its label flips from "Preparing…" once ready.
    expect(await screen.findByRole('button', { name: 'Download contract (PDF)' })).toBeEnabled();

    // Progress card.
    expect(screen.getByText('Project progress')).toBeInTheDocument();

    // Phases card: heading, phase title, amount + duration badges, task bullets.
    expect(screen.getByRole('heading', { name: 'Project phases' })).toBeInTheDocument();
    expect(await screen.findByText('Phase 1: Foundations')).toBeInTheDocument();
    expect(screen.getByText('100,000')).toBeInTheDocument();
    expect(screen.getByText('3 days')).toBeInTheDocument();
    expect(screen.getByText('Site prep and clearing.')).toBeInTheDocument();
  });

  it('enables Resend once the phases are loaded (emails are auto-fetched backend-side)', async () => {
    useAuthStore.setState({
      user: { id: 100, role: 'USER', email: 'owner@example.com' },
      isAuthenticated: true,
    });
    mockBackend();
    renderWithProviders(<ContractSigningProjectDetail projectId={PROJECT_ID} />);

    const resend = await screen.findByRole('button', { name: 'Resend' });
    // /signatures only needs projectId + phaseIds + language — no technician email lookup.
    await screen.findByText('Phase 1: Foundations');
    expect(resend).toBeEnabled();
  });

  it('shows the technician a view + download card — no send / resend / "I have signed"', async () => {
    useAuthStore.setState({
      user: { id: 9, role: 'TECHNICIAN', email: 'tech@example.com' },
      isAuthenticated: true,
    });
    server.use(
      http.get('*/projects/:id', () => HttpResponse.json({ project: PROJECT, phases: PHASES })),
      http.get('*/phases/project/:projectId', () => HttpResponse.json(PHASES)),
      http.get('*/contracts/project/:projectId', () =>
        HttpResponse.json({ ...CONTRACT, documentUrl: 'https://cdn.example.com/c/501.pdf' }),
      ),
      profileHandler,
    );
    renderWithProviders(<ContractSigningProjectDetail projectId={PROJECT_ID} />);

    // The counterpart card flips to the CLIENT for the technician — heading + client
    // name, and the message action targets the client (`user=100`), never the
    // technician themselves (the prior self-chat bug).
    expect(await screen.findByText('Project client')).toBeInTheDocument();
    expect(await screen.findByText('Owner Saleh')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Message the client' })).toHaveAttribute(
      'href',
      expect.stringContaining('user=100'),
    );
    expect(screen.queryByText('Selected service provider')).not.toBeInTheDocument();

    // Technician's view+download card (RN's isTechnician branch).
    expect(await screen.findByText('Contract ready for signature')).toBeInTheDocument();
    // Download pre-generates the PDF (POST /contracts/test/generate-pdf) then opens it.
    expect(await screen.findByRole('button', { name: 'Download contract (PDF)' })).toBeEnabled();

    // The technician cannot initiate / resend / acknowledge — both parties sign by email.
    expect(screen.queryByRole('button', { name: 'Resend' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'I have signed' })).not.toBeInTheDocument();
    expect(screen.queryByText('The contract was sent to your email')).not.toBeInTheDocument();
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
