import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { SupervisionControlPanel } from './supervision-control-panel';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

/** Wildcard overrides for the same-origin proxy URLs the component hits in happy-dom.
 *  The supervisor-state + activity routes are served by the default supervision
 *  handlers (ACTIVE + empty log). */
function arrange() {
  server.use(
    http.get('*/projects/:id', () =>
      HttpResponse.json({
        id: 213,
        serviceNameEn: 'Multi-party Project Management',
        budget: 30000,
        address: 'Riyadh',
        userName: 'Farahat',
        timeRequiredDays: 28,
        status: 'PENDING',
      }),
    ),
    http.get('*/bids/project/:id', () =>
      HttpResponse.json([
        {
          id: 1,
          projectId: 213,
          proposedBudget: 25000,
          estimatedDurationDays: 21,
          status: 'PENDING',
          technicianName: 'Khalid',
        },
        {
          id: 2,
          projectId: 213,
          proposedBudget: 40000,
          estimatedDurationDays: 30,
          status: 'ACCEPTED',
          technicianName: 'Verified Tech',
        },
      ]),
    ),
  );
}

describe('SupervisionControlPanel', () => {
  it('lists bids with accept/reject on pending bids and a pill on decided ones', async () => {
    arrange();
    renderWithProviders(<SupervisionControlPanel projectId={213} />);

    expect(await screen.findByRole('button', { name: 'Accept bid' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Back to supervision')).toBeInTheDocument();
  });

  it('renders the empty activity log once active', async () => {
    arrange();
    renderWithProviders(<SupervisionControlPanel projectId={213} />);

    expect(await screen.findByText('No activity yet')).toBeInTheDocument();
  });
});
