import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { MyBid } from '../schemas/bid';
import type { Project } from '../schemas/project';

import { getMyBids, mergeTechnicianProjects, myBidToProject } from './get-my-bids';

/** Mirrors the dev `/bids/my` shape (tech 444 → customer 443, project 190). */
const PENDING_BID: MyBid = {
  id: 134,
  projectId: 190,
  projectDescription: 'Test the web',
  projectBudget: 3500,
  userId: 443,
  userName: 'ahmed farahat 2',
  technicianId: 444,
  proposedBudget: 3455,
  comment: 'eslammmms',
  status: 'PENDING',
  estimatedDurationDays: 28,
  createdAt: '2026-06-18T12:15:19.548',
};

describe('getMyBids', () => {
  it('returns the bare array body as-is', async () => {
    server.use(http.get('*/bids/my', () => HttpResponse.json([PENDING_BID])));
    const bids = await getMyBids();
    expect(bids).toEqual([PENDING_BID]);
  });

  it('unwraps a { content } envelope', async () => {
    server.use(http.get('*/bids/my', () => HttpResponse.json({ content: [PENDING_BID] })));
    const bids = await getMyBids();
    expect(bids.map((b) => b.id)).toEqual([134]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(http.get('*/bids/my', () => HttpResponse.json({ unexpected: 'shape' })));
    expect(await getMyBids()).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/bids/my', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getMyBids().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});

describe('myBidToProject', () => {
  it('folds a pending bid into a BID_RECEIVED project carrying the bid fields', () => {
    expect(myBidToProject(PENDING_BID)).toEqual<Project>({
      id: 190,
      status: 'BID_RECEIVED',
      budget: 3500,
      title: 'Test the web',
      description: 'Test the web',
      userId: 443,
      userName: 'ahmed farahat 2',
      createdAt: '2026-06-18T12:15:19.548',
      timeRequiredDays: 28,
    });
  });

  it('surfaces the real project status for an accepted bid', () => {
    const project = myBidToProject({
      ...PENDING_BID,
      status: 'ACCEPTED',
      projectStatus: 'APPROVED',
    });
    expect(project.status).toBe('APPROVED');
  });

  it('defaults an accepted bid without projectStatus to APPROVED', () => {
    expect(myBidToProject({ ...PENDING_BID, status: 'ACCEPTED' }).status).toBe('APPROVED');
  });

  it('falls back to the proposed budget when the project budget is absent', () => {
    expect(myBidToProject({ ...PENDING_BID, projectBudget: undefined }).budget).toBe(3455);
  });
});

describe('mergeTechnicianProjects', () => {
  const ASSIGNED: Project = { id: 186, status: 'APPROVED', userName: 'ahmed farahat 2' };

  it('prepends bid-phase projects to the assigned list', () => {
    const merged = mergeTechnicianProjects([ASSIGNED], [PENDING_BID]);
    expect(merged.map((p) => p.id)).toEqual([190, 186]);
    expect(merged[0]?.status).toBe('BID_RECEIVED');
  });

  it('drops a bid whose project is already assigned (accepted bid de-dup)', () => {
    const acceptedTwin: MyBid = { ...PENDING_BID, projectId: 186, status: 'ACCEPTED' };
    const merged = mergeTechnicianProjects([ASSIGNED], [acceptedTwin]);
    expect(merged.map((p) => p.id)).toEqual([186]);
    expect(merged[0]?.status).toBe('APPROVED'); // the assigned entry, not the bid twin
  });

  it('skips small-task bids and bids without a project id', () => {
    const smallTask: MyBid = { ...PENDING_BID, projectId: 200, smallTaskRequestId: 5 };
    const noProject: MyBid = { ...PENDING_BID, projectId: undefined };
    const merged = mergeTechnicianProjects([], [smallTask, noProject, PENDING_BID]);
    expect(merged.map((p) => p.id)).toEqual([190]);
  });

  it('de-dups two bids on the same project', () => {
    const merged = mergeTechnicianProjects([], [PENDING_BID, { ...PENDING_BID, id: 999 }]);
    expect(merged.map((p) => p.id)).toEqual([190]);
  });
});
