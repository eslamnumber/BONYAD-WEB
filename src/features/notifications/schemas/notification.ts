/**
 * Mirrors `Notification` from website-bonyad/src/services/NotificationService.ts.
 *
 * Permissive — every field except `id` is optional and `type` is a bare string
 * (never a `z.enum`) so a new backend notification type doesn't surface as a
 * misleading "Something went wrong". The backend may send a single
 * `title`/`message` or localised `titleEn`/`titleAr` + `messageEn`/`messageAr`
 * pairs; the locale-aware reads live in the UI layer (Phase 5c).
 */
export type Notification = {
  id: number;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  message?: string;
  messageEn?: string;
  messageAr?: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
  relatedProjectId?: number | null;
  relatedBidId?: number | null;
  relatedPhaseId?: number | null;
};

/** Spring-style page envelope the list endpoint may return instead of a bare array. */
export type PaginatedNotificationsResponse = {
  content?: Notification[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  size?: number;
};
