import { http, HttpResponse } from 'msw';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';
import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { JobOfferDetail } from './job-offer-detail';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

beforeEach(() => {
  server.use(
    http.get('*/bids/project/:projectId', () => HttpResponse.json([])),
    http.get('*/phases/project/:projectId', () => HttpResponse.json([])),
  );
});

const detailResponse = (status: string) => ({
  project: {
    id: 42,
    status,
    userName: 'Ahmed',
    serviceNameEn: 'Construction',
    description: 'Brief.',
    budget: 80000,
    address: 'Riyadh',
    createdAt: new Date().toISOString(),
  },
  phases: [],
});

describe('JobOfferDetail phase gating', () => {
  it.each(['PENDING', 'BIDDING', 'BID_RECEIVED'])(
    'renders the detail in the %s phase',
    async (status) => {
      server.use(http.get('*/projects/:id', () => HttpResponse.json(detailResponse(status))));
      renderWithProviders(<JobOfferDetail projectId={42} />);
      expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
    },
  );

  it('blocks the detail once the project moves past the bid phase (e.g. COMPLETED)', async () => {
    server.use(http.get('*/projects/:id', () => HttpResponse.json(detailResponse('COMPLETED'))));
    renderWithProviders(<JobOfferDetail projectId={42} />);
    expect(await screen.findByText(/no longer open for offers/i)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });
});
