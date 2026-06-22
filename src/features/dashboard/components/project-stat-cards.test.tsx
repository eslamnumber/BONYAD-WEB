import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';
import { renderWithProviders, screen } from '@/testing/render';

import { ProjectStatCards } from './project-stat-cards';

// The component fetches `GET /technicians/me/dashboard` through the in-browser
// proxy path (`/api/proxy/...`) in jsdom, so the handler matches with a wildcard.
const dashboard = (summary: Record<string, unknown>) =>
  http.get('*/technicians/me/dashboard', () =>
    HttpResponse.json({
      technician: null,
      summary,
      active_projects: [],
      next_payments: [],
      recent_bids: [],
      earnings_chart: { monthly: [] },
    }),
  );

describe('ProjectStatCards', () => {
  it('renders live KPI figures from the dashboard summary (not the old static placeholders)', async () => {
    server.use(dashboard({ win_rate: 0.62, active_projects: 7, total_projects: 19 }));
    renderWithProviders(<ProjectStatCards />);

    // win_rate (0–1) → rounded percentage; counts as integers.
    expect(await screen.findByText('62%')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    // The previously hardcoded placeholders must be gone.
    expect(screen.queryByText('48%')).not.toBeInTheDocument();
    expect(screen.queryByText('32')).not.toBeInTheDocument();
  });

  it('degrades every missing summary field to an em-dash', async () => {
    server.use(dashboard({}));
    renderWithProviders(<ProjectStatCards />);

    const dashes = await screen.findAllByText('—');
    expect(dashes).toHaveLength(3);
  });
});
