import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import type { ProjectDetail } from '../../schemas/project';

import { OfferAcceptedCard } from './offer-accepted-card';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const PROJECT: ProjectDetail = { id: 42, userId: 7, userName: 'Sara' };
const ACCEPTED = {
  id: 2,
  projectId: 42,
  status: 'ACCEPTED',
  proposedBudget: 250000,
  estimatedDurationDays: 30,
  createdAt: '2026-06-05T12:00:00Z',
};
const PENDING = {
  id: 1,
  projectId: 42,
  status: 'PENDING',
  proposedBudget: 100000,
  estimatedDurationDays: 20,
};

describe('OfferAcceptedCard', () => {
  it('renders the accepted offer value, execution period and acceptance date', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([PENDING, ACCEPTED])));
    renderWithProviders(<OfferAcceptedCard project={PROJECT} />);
    expect(await screen.findByText('250,000')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('5 June 2026')).toBeInTheDocument();
    expect(screen.getByText('Your offer was accepted')).toBeInTheDocument();
  });

  it('links "Contact the client" to the client conversation; the contract action stays a button', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([ACCEPTED])));
    renderWithProviders(<OfferAcceptedCard project={PROJECT} />);
    const contact = await screen.findByRole('link', { name: /contact the client/i });
    const href = contact.getAttribute('href') ?? '';
    expect(href).toContain('/dashboard/messages?');
    expect(href).toContain('user=7');
    expect(href).toContain('project=42');
    expect(screen.getByRole('button', { name: /review & sign the contract/i })).toBeInTheDocument();
  });

  it('falls back to "—" for every value when no bid is accepted', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([PENDING])));
    renderWithProviders(<OfferAcceptedCard project={PROJECT} />);
    expect(await screen.findByText('Your offer was accepted')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('has no a11y violations', async () => {
    server.use(http.get('*/bids/project/:projectId', () => HttpResponse.json([ACCEPTED])));
    const { container } = renderWithProviders(<OfferAcceptedCard project={PROJECT} />);
    await screen.findByText('250,000');
    expect(await axe(container)).toHaveNoViolations();
  });
});
