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
  DASHBOARD_PAYMENTS: '/dashboard/payments',
  DASHBOARD_SAVED: '/dashboard/saved',
  DASHBOARD_MESSAGES: '/dashboard/messages',
  DASHBOARD_NOTIFICATIONS: '/dashboard/notifications',
  DASHBOARD_SETTINGS: '/dashboard/settings',
} as const;

/**
 * Same-origin Next route handlers (NOT backend endpoints). These set/clear the
 * httpOnly session cookie server-side. Called from the client via
 * `apiClient.post(..., { internal: true })`.
 */
export const INTERNAL_API = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  /** Runtime backend switcher (beta-tester tool). Persists env + clears session. */
  API_ENVIRONMENT: '/api/dev/api-environment',
  /**
   * Mints a broker credential for the browser MQTT client. Reads the httpOnly
   * session cookie server-side and returns the JWT the broker expects as its
   * username. See `src/lib/mqtt-chat.ts` + `docs/api-and-auth.md` §Realtime chat.
   */
  CHAT_MQTT_CREDENTIALS: '/api/chat/mqtt-credentials',
} as const;
