/**
 * Mirrors SubscriptionCategory from website-bonyad/src/types/subscription.ts.
 * Permissive — optional fields may grow as the backend evolves.
 */
export type SubscriptionPlan = {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  finalPrice?: number;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  durationDays?: number | null;
  active?: boolean;
  bidsPerWeek: number;
  discountPercentage?: number | null;
  hasActiveDiscount?: boolean;
  features?: string[];
};
