/**
 * Advertisement shapes — GET /ads/mine (the SP "إعلاناتي" panel) and GET /ads/feed
 * (the customer "Explore offers" feed). Mirrors the iOS `AdModels.swift` (backend-
 * integration reference only); the field names below are the ones VERIFIED live on
 * the dev backend (technician 444) — both endpoints return `{ ads: Ad[] }`.
 *
 * Permissive by hard rule 1: every field optional + nullable, `status` / `ctaType` /
 * `contactMethod` modelled as widening unions (never a `z.enum`), so a new backend
 * value never surfaces as a misleading "Something went wrong".
 */

/** Ad moderation/visibility state. Widening union, not a `z.enum`. */
export type AdStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'REJECTED'
  | 'EXPIRED'
  | (string & {});

/** Call-to-action kind (e.g. `REQUEST_PRICE`). Widening union. */
export type AdCtaType = string & {};

/** One advertisement. `id` is the only guaranteed field. */
export type Ad = {
  id: number;
  title?: string | null;
  body?: string | null;
  status?: AdStatus | null;
  impressions?: number | null;
  clicks?: number | null;
  /** Click-through rate as a percentage (e.g. `2.15`), already computed by the backend. */
  ctr?: number | null;
  isBoosted?: boolean | null;
  mediaUrls?: string[] | null;
  ctaType?: AdCtaType | null;
  ctaValue?: string | null;
  contactMethod?: string | null;
  contactPhone?: string | null;
  serviceId?: number | null;
  serviceNameEn?: string | null;
  serviceNameAr?: string | null;
  technicianId?: number | null;
  technicianName?: string | null;
  technicianProfileImage?: string | null;
  validUntil?: string | null;
  createdAt?: string | null;
  rejectionReason?: string | null;
};
