/**
 * A service region/zone (GET /regions) — the create-project location picker.
 * Mirrors RN `searchService.Region` (website-bonyad/src/utils/searchService.ts:17).
 * Permissive response type; only `id` is guaranteed, names + count are optional.
 */
export type Region = {
  id: number;
  nameEn?: string;
  nameAr?: string;
  techniciansCount?: number;
};
