/**
 * Unwrap a list endpoint that may return either a bare array or a Spring `{ content: [] }`
 * page envelope into a plain list; any other shape yields `[]` (rule 1: a permissive read
 * never throws a misleading error). Shared by the service-category and -subcategory
 * fetchers so the unwrap logic lives in one place.
 */
export function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) return content as T[];
  }
  return [];
}
