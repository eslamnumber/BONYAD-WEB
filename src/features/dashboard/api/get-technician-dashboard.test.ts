import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getTechnicianDashboard, normalizeTechnicianDashboard } from './get-technician-dashboard';

const FIXTURE = {
  technician: { id: 444, name: 'ahmed farahat tech', phone: '539909791' },
  summary: { active_projects: 2, total_earned_sar: 520, win_rate: 0.9 },
  active_projects: [{ id: 185, status: 'IN_PROGRESS', progress_pct: 0.75 }],
  next_payments: [{ id: 334, remaining: 200, status: 'AWAITING_APPROVAL' }],
  recent_bids: [{ id: 139, amount_sar: 300, status: 'ACCEPTED' }],
  earnings_chart: { monthly: [{ month: '2026-06', earned: 520 }] },
};

describe('getTechnicianDashboard', () => {
  it('GETs /technicians/me/dashboard and returns the parsed snapshot', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/technicians/me/dashboard', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(FIXTURE);
      }),
    );

    const dash = await getTechnicianDashboard();

    expect(new URL(capturedUrl).pathname.endsWith('/technicians/me/dashboard')).toBe(true);
    expect(dash.summary).toMatchObject({ active_projects: 2, win_rate: 0.9 });
    expect(dash.active_projects[0]).toMatchObject({ id: 185, progress_pct: 0.75 });
    expect(dash.next_payments).toHaveLength(1);
    expect(dash.recent_bids[0]).toMatchObject({ id: 139, status: 'ACCEPTED' });
    expect(dash.earnings_chart.monthly?.[0]).toMatchObject({ month: '2026-06', earned: 520 });
  });

  it('defaults missing collections to empty so the UI never guards for null', async () => {
    server.use(http.get('*/technicians/me/dashboard', () => HttpResponse.json({ summary: {} })));

    const dash = await getTechnicianDashboard();

    expect(dash.technician).toBeNull();
    expect(dash.active_projects).toEqual([]);
    expect(dash.next_payments).toEqual([]);
    expect(dash.recent_bids).toEqual([]);
    expect(dash.earnings_chart).toEqual({ monthly: [] });
  });

  it('normalizes a null/garbage body without throwing', () => {
    expect(normalizeTechnicianDashboard(null).active_projects).toEqual([]);
    expect(normalizeTechnicianDashboard({ active_projects: 'nope' }).active_projects).toEqual([]);
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/technicians/me/dashboard', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );

    const err = await getTechnicianDashboard().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
