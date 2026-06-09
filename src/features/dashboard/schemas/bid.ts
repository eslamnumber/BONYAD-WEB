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
