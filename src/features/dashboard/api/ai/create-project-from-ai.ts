import { z } from 'zod';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ServiceMatch } from './match-service';
import { isQualityTier, normalizeQualityTier } from './quality-tier';
import type { SowDocument } from './sow-types';

/** Backend returns `id` (canonical); `projectId` is a legacy alias that must keep working. */
export type FromAiProjectResponse = {
  success?: boolean;
  id?: number;
  projectId?: number;
  aiGenerated?: boolean;
  status?: string;
  title?: string;
  createdAt?: string;
};

export type CreateFromAiArgs = {
  sow: SowDocument;
  match: ServiceMatch;
  address: string;
  latitude?: number;
  longitude?: number;
  conversationId: string;
  locale: string;
};

/** Scalar envelope is validated (rule 1); the SOW payload stays permissive. */
const fromAiEnvelopeSchema = z.object({
  qualityTier: z.string(),
  locale: z.string(),
  conversationId: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  serviceCategoryId: z.number().nullable(),
  serviceSubcategoryId: z.number().nullable(),
  serviceId: z.number().positive(),
  timeRequiredDays: z.number().positive(),
  /** Assignment type — `'ALL'` opens the project for bids, exactly like manual
   *  creation (`buildCreateProjectFormData` → `projectType: 'ALL'`). Without it the
   *  backend never marks the AI project biddable, so it never reaches the technician
   *  pool (GET /projects → pending + unassigned). */
  projectType: z.string(),
});

/** AI projects are always open for bids (the publish flow has no direct-assign step). */
const AI_PROJECT_TYPE = 'ALL';

function resolveQualityTier(sow: SowDocument): string {
  const raw = sow.project_metadata?.quality_tier;
  return isQualityTier(raw) ? raw : normalizeQualityTier(raw) || 'B';
}

function timeRequiredDays(sow: SowDocument): number {
  const weeks = sow.timeline?.duration_weeks;
  return Math.max(1, Math.round((typeof weeks === 'number' && weeks > 0 ? weeks : 1) * 7));
}

export function projectIdOf(res: FromAiProjectResponse): number | undefined {
  return typeof res.id === 'number' ? res.id : res.projectId;
}

/**
 * Create the project from a generated SOW (iOS `createProjectFromAI`). The resolved
 * IDs are mirrored top-level AND inside `sow`/`sowJsonRaw` (the backend reads either
 * location). `serviceId` MUST be a positive id — a null service match must block this
 * call upstream. Returns the created project; the canonical id is read via {@link projectIdOf}.
 */
export async function createProjectFromAi(args: CreateFromAiArgs): Promise<FromAiProjectResponse> {
  const envelope = fromAiEnvelopeSchema.parse({
    qualityTier: resolveQualityTier(args.sow),
    locale: args.locale,
    conversationId: args.conversationId,
    address: args.address.trim(),
    latitude: args.latitude,
    longitude: args.longitude,
    serviceCategoryId: args.match.categoryId,
    serviceSubcategoryId: args.match.subcategoryId,
    serviceId: args.match.serviceId,
    timeRequiredDays: timeRequiredDays(args.sow),
    projectType: AI_PROJECT_TYPE,
  });

  // Mirror the resolved IDs INSIDE the SOW too — the backend reads serviceId from
  // here, not just top-level, and rejects with "serviceId is required" otherwise
  // (iOS gotcha: keep the ids in both places). camelCase to match the top-level keys.
  const sowWithIds = {
    ...args.sow,
    serviceId: envelope.serviceId,
    serviceCategoryId: envelope.serviceCategoryId,
    serviceSubcategoryId: envelope.serviceSubcategoryId,
    qualityTier: envelope.qualityTier,
    timeRequiredDays: envelope.timeRequiredDays,
    projectType: envelope.projectType,
  };
  const body = { ...envelope, sow: sowWithIds, sowJsonRaw: sowWithIds };
  return apiClient.post<FromAiProjectResponse>(API_ENDPOINTS.AI.CREATE_FROM_AI, { body });
}
