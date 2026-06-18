import { z } from 'zod';

/**
 * Strict request body for POST /bids/create. Mirrors the RN call site
 * website-bonyad/src/screens/bids/BidFormModal.tsx:178 — `{ projectId,
 * proposedBudget, estimatedDurationDays, comment }`. The Phase-5c submit-offer
 * form has its own string-input form schema that transforms into this shape.
 */
export const createBidRequestSchema = z.object({
  projectId: z.number().int().positive(),
  proposedBudget: z.number().positive(),
  estimatedDurationDays: z.number().int().positive(),
  comment: z.string().trim().min(1),
});

export type CreateBidRequest = z.infer<typeof createBidRequestSchema>;

/**
 * The created bid. Permissive — only fields the UI may read are typed, so a
 * backend addition never surfaces as a misleading error.
 */
export type CreateBidResponse = {
  id?: number;
  projectId?: number;
  technicianId?: number;
  proposedBudget?: number;
  estimatedDurationDays?: number;
  comment?: string;
  status?: string;
  createdAt?: string;
};

/**
 * A bid as returned by GET /bids/project/:projectId. Mirrors the RN `BidResponse`
 * read in website-bonyad/src/screens/projects/approved/hooks/useApprovedProject.ts.
 * Permissive — only the fields the approved-project "offer accepted" card reads
 * are typed. NOTE: the backend Bid has no `acceptedAt`; `createdAt` (when the bid
 * was submitted) is the only timestamp, so the acceptance date falls back to it.
 */
export type ProjectBid = {
  id?: number;
  projectId?: number;
  technicianId?: number;
  technicianName?: string;
  proposedBudget?: number;
  estimatedDurationDays?: number;
  comment?: string;
  status?: string;
  createdAt?: string;
};

/**
 * A bid as returned by GET /bids/my — the signed-in technician's own bids across
 * every project. Verified on the dev backend: the bid carries a flattened copy of
 * its project (`projectId` / `projectDescription` / `projectBudget`) plus the
 * customer (`userId` / `userName`). Permissive — only the fields the Projects
 * screen reads when folding a bid into a pseudo-project are typed. `projectStatus`
 * is present once the bid is ACCEPTED (the real project status to surface);
 * `smallTaskRequestId` flags a small-task bid the screen skips (mirrors RN).
 */
export type MyBid = {
  id?: number;
  projectId?: number;
  projectDescription?: string;
  projectBudget?: number;
  projectStatus?: string;
  userId?: number;
  userName?: string;
  technicianId?: number;
  proposedBudget?: number;
  comment?: string;
  status?: string;
  estimatedDurationDays?: number;
  createdAt?: string;
  smallTaskRequestId?: number;
};

/**
 * A bid enriched with the technician's profile data (rating / review-count /
 * avatar) for the customer's bid-received list + accept modal. The bare
 * {@link ProjectBid} carries only `technicianName`; the rest comes from
 * `/users/:id/profile` (RN BidReceivedProjectScreen enriches every bid the same
 * way). All enrichment fields are optional — a missing or failed profile fetch
 * degrades the card to name-only and never blocks the list.
 */
export type BidWithTechnician = ProjectBid & {
  rating?: number;
  reviewCount?: number;
  avatarUrl?: string;
};
