/**
 * Post-approval setup shapes — permissive TS types (CLAUDE rule 1: never strict-parse a
 * backend response). These are feature-local copies (rule 6: features can't import from
 * other features) of catalog shapes already used by `features/home` (subscription plans,
 * GET /subscriptions/categories) and `features/dashboard` (service categories,
 * GET /services/categories). The fetchers reuse those features' query keys so the cache
 * is shared. Every field is optional beyond `id` so a future backend field never decodes
 * into a misleading error.
 */

/** A subscription plan/tier — the onboarding plan picker. Mirrors home's `SubscriptionPlan`. */
export type SetupPlan = {
  id: number;
  nameEn?: string;
  nameAr?: string;
  /** List price before any discount. */
  price?: number;
  /** Price actually charged (equals `price` when there's no discount). */
  finalPrice?: number;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  /** `null` for plans with no fixed duration (e.g. Free). */
  durationDays?: number | null;
  /** Bids this plan grants per week. */
  bidsPerWeek?: number | null;
  /**
   * Max distinct service categories this plan lets a technician offer (`null` =
   * unlimited). The services step caps how many distinct parent categories the selected
   * subservices may span. Mirrors RN `onboardingApi.ts` `SubscriptionPlan.maxCategories`.
   */
  maxCategories?: number | null;
  discountPercentage?: number | null;
  features?: string[];
};

/** A service category or subcategory. Mirrors dashboard's `Service`. */
export type SetupService = {
  id: number;
  nameEn?: string;
  nameAr?: string;
  imageUrl?: string | null;
  /** True for a top-level category, false/absent for a subcategory (leaf service). */
  isCategory?: boolean;
  parentService?: { id: number; nameEn?: string; nameAr?: string } | null;
};
