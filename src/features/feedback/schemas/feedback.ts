import { z } from 'zod';

const SUBJECT_MAX = 120;
const MESSAGE_MIN = 1;
export const MESSAGE_MAX = 1000;

/**
 * In-app feedback categories. The backend stores a free string; the client offers this
 * picked set, labels localised under `feedback.categories.*`. Mirrors the product
 * contract (SUGGESTION / BUG / COMPLAINT / PRAISE / OTHER).
 */
export const FEEDBACK_CATEGORIES = ['SUGGESTION', 'BUG', 'COMPLAINT', 'PRAISE', 'OTHER'] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

/**
 * Compose-form values (client). `message` is required (non-whitespace, hard-capped at
 * {@link MESSAGE_MAX}); `subject` is optional; `category` always holds a valid default.
 * Error messages are i18n keys resolved in the field components.
 */
export const feedbackFormSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  subject: z.string().trim().max(SUBJECT_MAX, 'feedback.errors.subjectTooLong'),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, 'feedback.errors.messageRequired')
    .max(MESSAGE_MAX, 'feedback.errors.messageTooLong'),
});
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

/**
 * Strict request body for POST /app-feedback (CLAUDE rule 1 — strict request). `subject` is
 * sent as `null` when blank; `attachments` is omitted when empty (upload UI not wired yet).
 */
export const createFeedbackSchema = z.object({
  category: z.string(),
  subject: z.string().nullable(),
  message: z.string(),
  attachments: z.array(z.string()).optional(),
});
export type CreateFeedbackBody = z.infer<typeof createFeedbackSchema>;

/**
 * A feedback record. Permissive TS type (CLAUDE rule 1 — never strict-parse a response):
 * `category` / `status` are backend-controlled strings, never zod-enumerated, so a new
 * server-side value never surfaces as a misleading error.
 */
export type AppFeedback = {
  id: number;
  category?: string | null;
  subject?: string | null;
  message?: string | null;
  attachments?: string[] | null;
  status?: string | null;
  createdAt?: string | null;
  adminNote?: string | null;
  reviewedAt?: string | null;
};

/** GET /app-feedback/mine — a `{ success, count, feedback }` envelope or a bare array. */
export type AppFeedbackListBody =
  | AppFeedback[]
  | { success?: boolean; count?: number; feedback?: AppFeedback[]; data?: AppFeedback[] };
