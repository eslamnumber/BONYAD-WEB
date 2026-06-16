import { useQueries, useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { BidWithTechnician, ProjectBid } from '../schemas/bid';
import type { UserProfile } from '../schemas/user-profile';

import {
  getUserProfile,
  profileAvatar,
  profileRating,
  profileReviewCount,
  userProfileQueryKey,
} from './get-user-profile';

export const projectBidsQueryKey = (projectId: number) => ['projects', 'bids', projectId] as const;

/**
 * All bids on a project. Mirrors the RN call site
 * website-bonyad/src/screens/projects/approved/hooks/useApprovedProject.ts — GET
 * /bids/project/:projectId (a bare array; a `{ content }` envelope is tolerated
 * for backend flexibility). The technician's approved-project screen reads the
 * ACCEPTED bid from this list (see {@link findAcceptedBid}) to populate the
 * "offer accepted" card. Browser calls go through `/api/proxy/*`, which attaches
 * the session token.
 */
export async function getProjectBids(projectId: number): Promise<ProjectBid[]> {
  const path = API_ENDPOINTS.BIDS.LIST.replace(':projectId', String(projectId));
  const data = await apiClient.get<unknown>(path);
  return extractBids(data);
}

function extractBids(data: unknown): ProjectBid[] {
  if (Array.isArray(data)) return data as ProjectBid[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: ProjectBid[] }).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

/** The accepted bid (the one the customer chose), or undefined while none is accepted. */
export function findAcceptedBid(bids: ProjectBid[]): ProjectBid | undefined {
  return bids.find((bid) => (bid.status ?? '').toUpperCase() === 'ACCEPTED');
}

/** The signed-in technician's own bid on the project, or undefined when they haven't bid. */
export function findMyBid(
  bids: ProjectBid[],
  technicianId: number | undefined,
): ProjectBid | undefined {
  if (technicianId === undefined) return undefined;
  return bids.find((bid) => bid.technicianId === technicianId);
}

/**
 * The signed-in technician's own bid on a project (Figma "Offer sent" state).
 * Shares the {@link projectBidsQueryKey} cache with {@link useAcceptedBid} — one
 * fetch, two `select`s. `technicianId` comes from the auth store; undefined while
 * the session hasn't hydrated yields no bid (the submit form shows).
 */
export function useMyBid(projectId: number, technicianId: number | undefined) {
  return useQuery({
    queryKey: projectBidsQueryKey(projectId),
    queryFn: () => getProjectBids(projectId),
    staleTime: 1000 * 60 * 5,
    select: (bids) => findMyBid(bids, technicianId),
  });
}

/**
 * The project's accepted bid. Fetches the bids list and selects the ACCEPTED one
 * client-side, so the cached array is shared with any other bids consumer.
 */
export function useAcceptedBid(projectId: number) {
  return useQuery({
    queryKey: projectBidsQueryKey(projectId),
    queryFn: () => getProjectBids(projectId),
    staleTime: 1000 * 60 * 5,
    select: findAcceptedBid,
  });
}

/** Unique, defined technician ids across a bids list (the profiles to fetch). */
export function uniqueTechnicianIds(bids: ProjectBid[] | undefined): number[] {
  const ids = (bids ?? [])
    .map((bid) => bid.technicianId)
    .filter((id): id is number => typeof id === 'number');
  return [...new Set(ids)];
}

/** Merge a bid with its technician profile (rating / review-count / avatar). */
export function enrichBid(bid: ProjectBid, profiles: Map<number, UserProfile>): BidWithTechnician {
  const profile = bid.technicianId !== undefined ? profiles.get(bid.technicianId) : undefined;
  return {
    ...bid,
    rating: profileRating(profile),
    reviewCount: profileReviewCount(profile),
    avatarUrl: profileAvatar(profile),
  };
}

/** The id of the lowest-budget bid — the "best value" highlight — or undefined. */
export function bestValueBidId(bids: ProjectBid[]): number | undefined {
  let best: ProjectBid | undefined;
  for (const bid of bids) {
    if (typeof bid.proposedBudget !== 'number') continue;
    if (!best || bid.proposedBudget < (best.proposedBudget ?? Number.POSITIVE_INFINITY)) best = bid;
  }
  return best?.id;
}

/**
 * All bids on a project, enriched with each technician's rating + avatar, for the
 * customer's bid-received list + accept modal. The bids array is fetched once
 * (shared {@link projectBidsQueryKey} cache); the unique technician profiles are
 * fetched in parallel via {@link useQueries} (each cached on its own key) and
 * merged in. A failed profile fetch degrades that card to name-only — it never
 * blocks the list. Returns a flat `{ bids, isPending, isError }` view.
 */
export function useProjectBids(projectId: number) {
  const bidsQuery = useQuery({
    queryKey: projectBidsQueryKey(projectId),
    queryFn: () => getProjectBids(projectId),
    staleTime: 1000 * 60 * 5,
  });

  const technicianIds = uniqueTechnicianIds(bidsQuery.data);
  const profileQueries = useQueries({
    queries: technicianIds.map((id) => ({
      queryKey: userProfileQueryKey(id),
      queryFn: () => getUserProfile(id),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const profiles = new Map<number, UserProfile>();
  technicianIds.forEach((id, i) => {
    const data = profileQueries[i]?.data;
    if (data) profiles.set(id, data);
  });

  return {
    bids: (bidsQuery.data ?? []).map((bid) => enrichBid(bid, profiles)),
    isPending: bidsQuery.isPending,
    isError: bidsQuery.isError,
  };
}
