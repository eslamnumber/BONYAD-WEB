/**
 * Centralized route paths. Components and `next/link` `href` props MUST come
 * from here — no raw path strings in JSX.
 *
 * Static paths are plain strings. Dynamic paths are factory functions so the
 * type system enforces param shape.
 */

export const ROUTES = {
  // Public marketing surface
  HOME: '/',
  FOR_PROS: '/for-pros',
  SERVICES: '/services',
  SERVICE_CATEGORY: (slug: string) => `/services/${slug}`,
  TECHNICIANS: '/technicians',
  TECHNICIAN_DETAIL: (id: string) => `/technicians/${id}`,
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  HELP: '/help',
  HELP_ARTICLE: (id: string) => `/help/${id}`,
  HOW_IT_WORKS: '/how-it-works',
  FAQ: '/faq',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  ABOUT: '/about',

  // Auth (not yet implemented — placeholders for nav links)
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',

  // Authenticated app surface (not yet implemented)
  APP_HOME: '/app',
  APP_PROFILE: '/app/profile',
  DASHBOARD: '/dashboard',
  DASHBOARD_JOB_OFFERS: '/dashboard/job-offers',
  DASHBOARD_JOB_OFFER: (id: string) => `/dashboard/job-offers/${id}`,
  DASHBOARD_PROJECTS: '/dashboard/projects',
  /** Create-a-project chooser — the launcher that offers the four creation methods
   *  (Figma 1574:2384); "New project" routes on to the method picker below. */
  DASHBOARD_PROJECTS_CREATE: '/dashboard/projects/create',
  /** "Create a project" method picker (Figma 1579:2551) — reached from the chooser's
   *  "New project" card; offers the AI assistant (Omda, beta) and manual entry. The
   *  manual option routes on to the wizard below. */
  DASHBOARD_PROJECTS_CREATE_PROJECT: '/dashboard/projects/create/project',
  /** Omdah AI Q&A interview (Figma 1583:2747) — reached from the method picker's AI
   *  row. A local 7-question guided interview (no backend yet); SOW generation is later. */
  DASHBOARD_PROJECTS_CREATE_AI: '/dashboard/projects/create/ai',
  /** Customer create-project wizard (Figma 1394:7041…). */
  DASHBOARD_PROJECTS_NEW: '/dashboard/projects/new',
  /** Assigned-project detail — dispatches approved / completed (Figma 1103:6757) / in-progress by status. */
  DASHBOARD_PROJECT: (id: string) => `/dashboard/projects/${id}`,
  DASHBOARD_PAYMENTS: '/dashboard/payments',
  /** Standalone HyperPay return page (fallback). Phase payments now return to the
   *  project detail page itself, which verifies the charge, marks the phase paid, and
   *  shows the result as a modal in place (Figma 1553:8142). This page stays as a
   *  belt-and-braces landing; phase context travels in the querystring
   *  (`?type=phase&phaseId=&paymentType=&amount=`). */
  PAYMENT_CALLBACK: '/payment/callback',
  /** Customer "Offers" (العروض) — offers/bids received on the customer's projects. Placeholder; screen TBD. */
  DASHBOARD_OFFERS: '/dashboard/offers',
  DASHBOARD_SAVED: '/dashboard/saved',
  DASHBOARD_MESSAGES: '/dashboard/messages',
  /** Messages screen with a specific user's conversation pre-selected (deep-link). */
  DASHBOARD_MESSAGE_FOR: (userId: number, opts?: { name?: string; projectId?: number }) => {
    const params = new URLSearchParams({ user: String(userId) });
    if (opts?.name) params.set('name', opts.name);
    if (opts?.projectId !== undefined) params.set('project', String(opts.projectId));
    return `/dashboard/messages?${params.toString()}`;
  },
  DASHBOARD_NOTIFICATIONS: '/dashboard/notifications',
  /** Profile / account hub — the target of the sidebar gear nav item (both roles). */
  DASHBOARD_SETTINGS: '/dashboard/settings',
  /**
   * Profile sub-screens reached from the account hub. Placeholders — the hub
   * ships first; each detail screen is built later (like DASHBOARD_SAVED /
   * DASHBOARD_OFFERS). Until then they 404, which is the intended placeholder
   * behaviour (see docs + the footer-placeholder convention).
   */
  DASHBOARD_SETTINGS_PROFILE: '/dashboard/settings/profile',
  /**
   * "My info" sub-screens reached from the profile hub (iOS `MyProfileView`).
   * The hub ships first; the edit-form / phone-change+OTP / password-change
   * detail screens are built later, so these are placeholders (404 until then,
   * the same intentional behaviour as the other settings sub-routes).
   */
  DASHBOARD_SETTINGS_PROFILE_EDIT: '/dashboard/settings/profile/edit',
  DASHBOARD_SETTINGS_CHANGE_PHONE: '/dashboard/settings/profile/phone',
  DASHBOARD_SETTINGS_CHANGE_PASSWORD: '/dashboard/settings/profile/password',
  DASHBOARD_SETTINGS_ACCOUNT_TYPE: '/dashboard/settings/account-type',
  DASHBOARD_SETTINGS_PORTFOLIO: '/dashboard/settings/portfolio',
  DASHBOARD_SETTINGS_SERVICES: '/dashboard/settings/services',
  DASHBOARD_SETTINGS_CARDS: '/dashboard/settings/cards',
  /**
   * My Subscriptions (technician-only) — the live subscription-management screen
   * (iOS `SubscriptionManagementView`): current plan, weekly bid quota, and cancel.
   * Built, not a placeholder.
   */
  DASHBOARD_SETTINGS_SUBSCRIPTIONS: '/dashboard/settings/subscriptions',
  /**
   * Support center (both roles) — open a support request and track existing ones by
   * status. The live authenticated ticket screen (mirrors the iOS support flow);
   * target of the profile hub's "Support center" row. Built, not a placeholder.
   */
  DASHBOARD_SETTINGS_SUPPORT: '/dashboard/settings/support',
  DASHBOARD_SETTINGS_REFERRAL: '/dashboard/settings/referral',
  DASHBOARD_SETTINGS_FEEDBACK: '/dashboard/settings/feedback',
  DASHBOARD_SETTINGS_DELETE: '/dashboard/settings/delete',
} as const;

/**
 * Same-origin Next route handlers (NOT backend endpoints). These set/clear the
 * httpOnly session cookie server-side. Called from the client via
 * `apiClient.post(..., { internal: true })`.
 */
export const INTERNAL_API = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  /**
   * Verify a phone-change OTP server-side. The backend rotates the JWT on success,
   * so this route re-mints the httpOnly session cookie with the fresh token (the
   * browser can't) and returns the updated user. Body: `{ userId, otpCode }`.
   */
  AUTH_CHANGE_PHONE_VERIFY: '/api/auth/change-phone-verify',
  /**
   * Verify a registration OTP server-side. The backend issues a session token on
   * success; this route uses it ONCE (server-side) to record the Terms agreement
   * (POST /users/terms/approve) before discarding it — the token never reaches
   * browser JS. Recording is best-effort and never blocks verification. Body:
   * `{ phoneNumber, otpCode, role, termsId? }`.
   */
  AUTH_VERIFY_OTP: '/api/auth/verify-otp',
  /** Runtime backend switcher (beta-tester tool). Persists env + clears session. */
  API_ENVIRONMENT: '/api/dev/api-environment',
  /**
   * Mints a broker credential for the browser MQTT client. Reads the httpOnly
   * session cookie server-side and returns the JWT the broker expects as its
   * username. See `src/lib/mqtt-chat.ts` + `docs/api-and-auth.md` §Realtime chat.
   */
  CHAT_MQTT_CREDENTIALS: '/api/chat/mqtt-credentials',
} as const;
