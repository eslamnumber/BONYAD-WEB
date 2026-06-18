/**
 * Subscription response shapes — permissive TS types (CLAUDE rule 1: never
 * strict-parse a backend response). These mirror the canonical iOS models in
 * `bonayd-ios/bonyad-cr-2/App/Models/SubscriptionModels.swift`, the single source
 * of truth for every subscription payload.
 *
 * Every field is optional by design: right after a paid plan activates the backend
 * can return a partial payload (the joined category races the payment webhook), and
 * accounts without a plan return `hasActiveSubscription` with a null category.
 * Keeping all fields optional means a successful state can never decode into a
 * misleading error.
 */

/** A subscription plan/category — joined into the status payload. */
export type SubscriptionCategory = {
  id?: number;
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
};

/** GET /users/subscription — the technician's current subscription status. */
export type Subscription = {
  userId?: string | number;
  hasActiveSubscription?: boolean;
  subscriptionCategory?: SubscriptionCategory | null;
  startDate?: string | null;
  endDate?: string | null;
  daysRemaining?: number | null;
};

/** GET /users/subscription/bids — weekly bid quota for the active plan. */
export type SubscriptionBids = {
  hasActiveSubscription?: boolean;
  subscriptionCategoryId?: number | null;
  subscriptionCategoryNameEn?: string | null;
  subscriptionCategoryNameAr?: string | null;
  weeklyQuota?: number | null;
  bidsRemaining?: number | null;
  lastResetAt?: string | null;
  nextResetAt?: string | null;
  secondsUntilReset?: number | null;
};
