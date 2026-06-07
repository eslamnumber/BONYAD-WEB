import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getAvailableProjects, getProjects } from './get-available-projects';

const PENDING_UNASSIGNED = {
  id: 1,
  status: 'PENDING',
  assignedTechnicianId: null,
  serviceNameEn: 'Building renovation',
  serviceNameAr: 'تجديد المباني',
  description: 'تحديث واجهة المبنى الإداري',
  budget: 200000,
  address: 'جدة',
  timeRequiredDays: 84,
  files: ['projects/1/cover.jpg'],
  bidsCloseAt: '2026-06-20T00:00:00Z',
};
const BIDDING_LOWERCASE = { id: 2, status: 'bidding', assignedTechnicianId: null };
const PENDING_BUT_ASSIGNED = { id: 3, status: 'PENDING', assignedTechnicianId: 99 };
const COMPLETED = { id: 4, status: 'COMPLETED', assignedTechnicianId: null };
const BID_RECEIVED_UNASSIGNED = { id: 5, status: 'BID_RECEIVED', assignedTechnicianId: null };
const APPROVED = { id: 6, status: 'APPROVED', assignedTechnicianId: null };
const IN_PROGRESS = { id: 7, status: 'IN_PROGRESS', assignedTechnicianId: null };

describe('getAvailableProjects', () => {
  it('shows only the pending + bid phases (PENDING, BIDDING, BID_RECEIVED), not later phases', async () => {
    server.use(
      http.get('*/projects', () =>
        HttpResponse.json([
          PENDING_UNASSIGNED,
          BIDDING_LOWERCASE,
          BID_RECEIVED_UNASSIGNED,
          APPROVED,
          IN_PROGRESS,
          COMPLETED,
        ]),
      ),
    );
    const projects = await getAvailableProjects();
    expect(projects.map((p) => p.id)).toEqual([1, 2, 5]);
  });

  it('returns only PENDING/BIDDING projects that are unassigned (paginated body)', async () => {
    server.use(
      http.get('*/projects', () =>
        HttpResponse.json({
          content: [PENDING_UNASSIGNED, BIDDING_LOWERCASE, PENDING_BUT_ASSIGNED, COMPLETED],
          totalElements: 4,
        }),
      ),
    );
    const projects = await getAvailableProjects();
    expect(projects.map((p) => p.id)).toEqual([1, 2]);
  });

  it('accepts a bare array body (non-paginated) for backend flexibility', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json([PENDING_UNASSIGNED])));
    const projects = await getAvailableProjects();
    expect(projects).toEqual([PENDING_UNASSIGNED]);
  });

  it('excludes assigned offers and non-biddable statuses', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json([PENDING_BUT_ASSIGNED, COMPLETED])));
    const projects = await getAvailableProjects();
    expect(projects).toEqual([]);
  });

  it('passes regionId as a query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/projects', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );
    await getAvailableProjects({ regionId: 7 });
    expect(new URL(capturedUrl).searchParams.get('regionId')).toBe('7');
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/projects', () => HttpResponse.json({ unexpected: 'shape' })));
    const projects = await getAvailableProjects();
    expect(projects).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/projects', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getAvailableProjects().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('en')).toBe('Unauthorized.');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});

describe('getProjects', () => {
  it('returns every project across all phases, unfiltered', async () => {
    server.use(
      http.get('*/projects', () =>
        HttpResponse.json([
          PENDING_UNASSIGNED,
          PENDING_BUT_ASSIGNED,
          BID_RECEIVED_UNASSIGNED,
          APPROVED,
          IN_PROGRESS,
          COMPLETED,
        ]),
      ),
    );
    const projects = await getProjects();
    expect(projects.map((p) => p.id)).toEqual([1, 3, 5, 6, 7, 4]);
  });
});
