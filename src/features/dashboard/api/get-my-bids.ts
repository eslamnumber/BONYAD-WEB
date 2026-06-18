import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { MyBid } from '../schemas/bid';
import type { Project } from '../schemas/project';

import { useAssignedProjects } from './get-assigned-projects';

export const myBidsQueryKey = () => ['bids', 'my'] as const;

/**
 * The signed-in technician's own bids (bid-phase work). Mirrors the RN call site
 * website-bonyad/src/screens/projects/general/hooks/useMyProjects.ts:361
 * (`loadMyBids`) — GET /bids/my. `/projects/my-assigned` is assigned-only (it
 * lists a project only once a bid is ACCEPTED), so the technician's pending bids
 * live exclusively here. Browser calls go through `/api/proxy/*`, which attaches
 * the session token. Returns the bare `MyBid[]`; a `{ content }` envelope is
 * tolerated for backend flexibility.
 */
export async function getMyBids(): Promise<MyBid[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.BIDS.MY_BIDS);
  return extractMyBids(data);
}

function extractMyBids(data: unknown): MyBid[] {
  if (Array.isArray(data)) return data as MyBid[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: MyBid[] }).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

/**
 * Fold a bid into the flat {@link Project} shape the Projects table renders. The
 * project label/value come from the bid's flattened project fields. Status is
 * `BID_RECEIVED` (the bid-phase pill, and what routes the row to the job-offer
 * detail) unless the bid is ACCEPTED, in which case the real project status is
 * surfaced — mirrors RN `loadMyBids`.
 */
export function myBidToProject(bid: MyBid): Project {
  const accepted = (bid.status ?? '').toUpperCase() === 'ACCEPTED';
  const status = accepted ? (bid.projectStatus ?? 'APPROVED') : 'BID_RECEIVED';
  return {
    id: bid.projectId as number,
    status,
    budget: bid.projectBudget ?? bid.proposedBudget ?? null,
    title: bid.projectDescription,
    description: bid.projectDescription,
    userId: bid.userId,
    userName: bid.userName,
    createdAt: bid.createdAt,
    timeRequiredDays: bid.estimatedDurationDays,
  };
}

/** A bid the Projects screen surfaces: a real project bid with a project id. */
function isListableBid(bid: MyBid): boolean {
  return typeof bid.projectId === 'number' && bid.smallTaskRequestId === undefined;
}

/**
 * Merge the technician's assigned projects with their bid-phase projects (folded
 * from /bids/my). Assigned entries win on overlap — an ACCEPTED bid's project is
 * already in `/projects/my-assigned` with full data (phases, real status), so its
 * bid-derived twin is dropped. Pending bids (the missing-from-the-screen case)
 * are prepended so fresh bids surface at the top.
 */
export function mergeTechnicianProjects(assigned: Project[], myBids: MyBid[]): Project[] {
  const seen = new Set(assigned.map((p) => p.id));
  const bidProjects: Project[] = [];
  for (const bid of myBids) {
    if (!isListableBid(bid)) continue;
    const project = myBidToProject(bid);
    if (seen.has(project.id)) continue;
    seen.add(project.id);
    bidProjects.push(project);
  }
  return [...bidProjects, ...assigned];
}

export function useMyBids() {
  return useQuery({
    queryKey: myBidsQueryKey(),
    queryFn: getMyBids,
    staleTime: 1000 * 30,
  });
}

/**
 * The full technician Projects list: `/projects/my-assigned` (assigned work) +
 * `/bids/my` (bid-phase work), merged + de-duplicated. Either source failing
 * degrades gracefully — the list shows whatever loaded, and only an error when
 * BOTH fail. Backs {@link ProjectsView}.
 */
export function useTechnicianProjects() {
  const assigned = useAssignedProjects();
  const myBids = useMyBids();
  const data = useMemo(
    () => mergeTechnicianProjects(assigned.data ?? [], myBids.data ?? []),
    [assigned.data, myBids.data],
  );
  return {
    data,
    isPending: assigned.isPending || myBids.isPending,
    isError: assigned.isError && myBids.isError,
  };
}
