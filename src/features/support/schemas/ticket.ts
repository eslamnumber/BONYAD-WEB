import { z } from 'zod';

const SUBJECT_MIN = 3;
const SUBJECT_MAX = 120;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;

/** Ticket priorities offered in the new-ticket form. Mirrors RN `TicketPriority`. */
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/** Ticket status filter (iOS segmented control). `ALL` sends no server filter. */
export const TICKET_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'] as const;
export type TicketFilter = (typeof TICKET_FILTERS)[number];

/** New-ticket form. Category / subcategory ids come from the fetched hierarchy. */
export const ticketFormSchema = z.object({
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
  priority: z.enum(TICKET_PRIORITIES),
  categoryId: z.number().nullable(),
  subcategoryId: z.number().nullable(),
});
export type TicketFormValues = z.infer<typeof ticketFormSchema>;

/** Strict POST /support/tickets body (rule 1 — strict request). */
export const createTicketSchema = z.object({
  subject: z.string(),
  description: z.string(),
  priority: z.string(),
  categoryId: z.number().optional(),
  subcategoryId: z.number().optional(),
});
export type CreateTicketBody = z.infer<typeof createTicketSchema>;

/** Strict reply body for POST /support/tickets/:id/messages (RN sends both keys). */
export const ticketReplySchema = z.object({ message: z.string(), content: z.string() });
export type TicketReplyBody = z.infer<typeof ticketReplySchema>;

/** A ticket message. Permissive (rule 1). Mirrors RN `SupportTicketMessage`. */
export type TicketMessage = {
  id: number;
  senderId?: number | null;
  senderName?: string | null;
  senderRole?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  createdAt?: string | null;
  isAdminMessage?: boolean | null;
};

/** A support ticket. Permissive (rule 1). Mirrors RN `SupportTicket`. */
export type SupportTicket = {
  id: number;
  subject: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  categoryId?: number | null;
  subcategoryId?: number | null;
  assignedAdminName?: string | null;
  attachmentUrls?: string[] | null;
  messages?: TicketMessage[] | null;
  unreadMessageCount?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

/** GET /support/tickets — bare array or `{ tickets }` / `{ data }` envelope. */
export type TicketListBody =
  | SupportTicket[]
  | { tickets?: SupportTicket[]; data?: SupportTicket[]; success?: boolean };

/** GET /support/categories/hierarchy — a nested category tree. */
export type SupportCategory = {
  id: number;
  nameEn?: string | null;
  nameAr?: string | null;
  hasChildren?: boolean | null;
  parentId?: number | null;
  children?: SupportCategory[] | null;
};
export type CategoryHierarchyBody =
  | SupportCategory[]
  | { categories?: SupportCategory[]; data?: SupportCategory[] };
