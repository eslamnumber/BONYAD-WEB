import { z } from 'zod';

const SUBJECT_MIN = 3;
const SUBJECT_MAX = 120;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;

/**
 * Support categories offered in the new-request form. The backend stores a free
 * string (the iOS client hard-codes `category: "General"` —
 * SupportRequestService.swift:86); we widen it to a small picked set, labels are
 * localised under `support.categories.*`.
 */
export const SUPPORT_CATEGORIES = [
  'General',
  'Account',
  'Payments',
  'Projects',
  'Technical',
  'Other',
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

/** Priority levels. Mirrors the iOS `priority: "MEDIUM"` field (uppercase strings). */
export const SUPPORT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

/**
 * New-request form values (client). `subject`/`description` are user text; the two
 * selects always hold a valid default (General / MEDIUM). Error messages are i18n keys.
 */
export const supportRequestFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(SUBJECT_MIN, 'support.errors.subjectTooShort')
    .max(SUBJECT_MAX, 'support.errors.subjectTooLong'),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, 'support.errors.descriptionTooShort')
    .max(DESCRIPTION_MAX, 'support.errors.descriptionTooLong'),
  category: z.enum(SUPPORT_CATEGORIES),
  priority: z.enum(SUPPORT_PRIORITIES),
});
export type SupportRequestFormValues = z.infer<typeof supportRequestFormSchema>;

/** Strict request body for POST /support/request (CLAUDE rule 1 — strict request). */
export const createSupportRequestSchema = z.object({
  subject: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
});
export type CreateSupportRequestBody = z.infer<typeof createSupportRequestSchema>;

/**
 * A support request. Permissive TS type (CLAUDE rule 1 — never strict-parse a
 * response): `status`/`priority`/`category` are backend-controlled strings, never
 * zod-enumerated. Mirrors the iOS `SupportRequest`
 * (bonayd-ios/.../Utils/SupportRequestService.swift:472).
 */
export type SupportRequest = {
  id: number;
  subject: string;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  assignedAdminId?: number | null;
  assignedAdminName?: string | null;
  chatRoomId?: number | null;
  chatRoomRoomId?: string | null;
  requestedAt?: string | null;
  assignedAt?: string | null;
  resolvedAt?: string | null;
};

/** GET /support/requests/:requestId — the list shape plus requester info. */
export type SupportRequestDetail = SupportRequest & {
  requesterId?: number | null;
  requesterName?: string | null;
  requesterPhone?: string | null;
  requesterEmail?: string | null;
};

/** GET /support/my-requests — a bare array or a `{ requests }` / `{ data }` envelope. */
export type SupportRequestListBody =
  | SupportRequest[]
  | { requests?: SupportRequest[]; data?: SupportRequest[]; success?: boolean };

/** POST /support/request → `{ id, status?, chatRoomRoomId?, message? }` (the iOS maps `id`). */
export type CreateSupportResponseBody = {
  id?: number;
  requestId?: number;
  status?: string;
  chatRoomRoomId?: string;
  message?: string;
  success?: boolean;
};
