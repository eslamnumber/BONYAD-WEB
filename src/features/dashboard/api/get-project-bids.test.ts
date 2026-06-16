import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import type { UserProfile } from '../schemas/user-profile';

import {
  bestValueBidId,
  enrichBid,
  findAcceptedBid,
  findMyBid,
  getProjectBids,
  uniqueTechnicianIds,
} from './get-project-bids';

const PENDING_BID = {
  id: 1,
  projectId: 42,
  technicianId: 445,
  proposedBudget: 100000,
  estimatedDurationDays: 20,
  status: 'PENDING',
  createdAt: '2026-06-01T00:00:00Z',
};
const ACCEPTED_BID = {
  id: 2,
  projectId: 42,
  technicianName: 'فني معتمد',
  proposedBudget: 250000,
  estimatedDurationDays: 30,
  status: 'ACCEPTED',
  createdAt: '2026-06-05T00:00:00Z',
};

describe('getProjectBids', () => {
  it('fetches /bids/project/:projectId and returns the bare array', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/bids/project/:projectId', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([PENDING_BID, ACCEPTED_BID]);
      }),
    );
    const bids = await getProjectBids(42);
    expect(new URL(capturedUrl).pathname).toMatch(/\/bids\/project\/42$/);
    expect(bids).toEqual([PENDING_BID, ACCEPTED_BID]);
  });

  it('unwraps a paginated { content } envelope', async () => {
    server.use(
      http.get('*/bids/project/:projectId', () => HttpResponse.json({ content: [ACCEPTED_BID] })),
    );
    expect(await getProjectBids(42)).toEqual([ACCEPTED_BID]);
  });

  it('returns [] when the body shape is unexpected', async () => {
    server.use(
      http.get('*/bids/project/:projectId', () => HttpResponse.json({ unexpected: 'shape' })),
    );
    expect(await getProjectBids(42)).toEqual([]);
  });

  it('throws ApiError with status / localized messages on 401', async () => {
    server.use(
      http.get('*/bids/project/:projectId', () =>
        HttpResponse.json(
          { messageEn: 'Unauthorized.', messageAr: 'غير مصرح.', errorCode: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );
    const err = await getProjectBids(42).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).errorCode).toBe('UNAUTHORIZED');
    expect((err as ApiError).localizedMessage('ar')).toBe('غير مصرح.');
  });
});

describe('findAcceptedBid', () => {
  it('returns the bid whose status is ACCEPTED', () => {
    expect(findAcceptedBid([PENDING_BID, ACCEPTED_BID])).toBe(ACCEPTED_BID);
  });

  it('is case-insensitive on the status string', () => {
    expect(findAcceptedBid([{ ...ACCEPTED_BID, status: 'accepted' }])?.id).toBe(2);
  });

  it('returns undefined when no bid is accepted', () => {
    expect(findAcceptedBid([PENDING_BID])).toBeUndefined();
    expect(findAcceptedBid([])).toBeUndefined();
  });
});

describe('findMyBid', () => {
  it('returns the bid whose technicianId matches the signed-in user', () => {
    expect(findMyBid([PENDING_BID, ACCEPTED_BID], 445)).toBe(PENDING_BID);
  });

  it('returns undefined when the technician has no bid on the project', () => {
    expect(findMyBid([ACCEPTED_BID], 445)).toBeUndefined();
  });

  it('returns undefined when the user id is unknown (session not hydrated)', () => {
    expect(findMyBid([PENDING_BID], undefined)).toBeUndefined();
  });
});

describe('uniqueTechnicianIds', () => {
  it('returns each defined technician id once', () => {
    const bids = [{ technicianId: 1 }, { technicianId: 1 }, { technicianId: 2 }, {}];
    expect(uniqueTechnicianIds(bids)).toEqual([1, 2]);
  });

  it('returns [] for undefined / empty input', () => {
    expect(uniqueTechnicianIds(undefined)).toEqual([]);
    expect(uniqueTechnicianIds([])).toEqual([]);
  });
});

describe('enrichBid', () => {
  const profiles = new Map<number, UserProfile>([
    [445, { averageRating: 4.9, totalReviews: 12, profileImage: 'a.jpg' }],
  ]);

  it('merges the matching technician profile (rating / count / avatar)', () => {
    expect(enrichBid(PENDING_BID, profiles)).toMatchObject({
      id: 1,
      rating: 4.9,
      reviewCount: 12,
      avatarUrl: 'a.jpg',
    });
  });

  it('leaves enrichment fields undefined when no profile is present', () => {
    const enriched = enrichBid({ id: 9, technicianId: 999 }, profiles);
    expect(enriched.rating).toBeUndefined();
    expect(enriched.reviewCount).toBeUndefined();
    expect(enriched.avatarUrl).toBeUndefined();
  });
});

describe('bestValueBidId', () => {
  it('returns the id of the lowest-budget bid', () => {
    expect(bestValueBidId([PENDING_BID, ACCEPTED_BID])).toBe(1);
  });

  it('ignores bids without a numeric budget, and returns undefined for none', () => {
    expect(bestValueBidId([{ id: 5 }, { id: 6, proposedBudget: 500 }])).toBe(6);
    expect(bestValueBidId([{ id: 5 }])).toBeUndefined();
    expect(bestValueBidId([])).toBeUndefined();
  });
});
