import type { Page, PageEnvelope } from '../schemas/transaction';

/**
 * Normalise a list response into one paginated {@link Page}. The backend returns a
 * Spring Data Page (`{ content, last, number, totalPages, … }`) but may degrade to
 * a bare array (treated as a single, final page). Permissive on purpose — an
 * unexpected shape yields an empty final page rather than throwing (rule 1).
 */
export function toPage<T>(data: unknown, requestedPage: number): Page<T> {
  if (Array.isArray(data)) {
    return { items: data as T[], number: requestedPage, isLast: true };
  }
  if (data && typeof data === 'object') {
    const page = data as PageEnvelope<T>;
    if (Array.isArray(page.content)) {
      const number = typeof page.number === 'number' ? page.number : requestedPage;
      const isLast =
        page.last ?? (typeof page.totalPages === 'number' ? number >= page.totalPages - 1 : true);
      return { items: page.content, number, isLast, totalElements: page.totalElements };
    }
  }
  return { items: [], number: requestedPage, isLast: true };
}
