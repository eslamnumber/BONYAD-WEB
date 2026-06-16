/**
 * Mirrors `ServiceCategory` from website-bonyad/src/services/ServiceService.ts.
 *
 * Permissive — only `id` is required so a future backend field addition never
 * surfaces as a misleading "Something went wrong". The create-project category
 * picker reads the localized name (`nameEn` / `nameAr`) via `LOCALE_DIRECTION`,
 * never one side directly.
 */
export type Service = {
  id: number;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string | null;
  svgUrl?: string | null;
  iconUrl?: string | null;
  useSvg?: boolean;
  /** True for a top-level category, false for a subcategory. */
  isCategory?: boolean;
  parentService?: { id: number; nameEn?: string; nameAr?: string } | null;
  displayOrder?: number;
  isActive?: boolean;
};
